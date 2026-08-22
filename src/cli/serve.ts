import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { LAYERS } from "../core/frontmatter.js";
import { readVault, vaultStats } from "../core/vault-reader.js";
import type { Layer, MemoryNote, SearchQuery, SearchResult } from "../core/types.js";
import type { SearchBackend } from "../search/backend.interface.js";
import { backends as registeredBackends } from "../search/backends/index.js";
import { CLASSIFICATION_RULES } from "../search/router.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const VAULT_DIR = join(PROJECT_ROOT, "vault");
const QUERIES_PATH = join(PROJECT_ROOT, "bench", "queries.json");

const PORT = Number(process.env.PORT ?? 4000);
const DEFAULT_LIMIT = 10;
const WARMUP_ROUNDS = 3; // เท่ากับ bench.ts เพื่อให้ ?repeat= เทียบกับตัวเลขใน README ได้ตรงๆ

const backendsByName = new Map<string, SearchBackend>(registeredBackends.map((b) => [b.name, b]));

const TOP_K = 5; // ต้องตรงกับ bench.ts เพื่อให้ recall@5 ที่ UI โชว์ตรงกับตัวเลขใน README

interface BenchQuery {
  id: string;
  text: string;
  kind: string;
  layer: Layer | null;
  relevant: string[];
}

/** โหลดตอน startup ครั้งเดียว — UI ใช้เป็น preset และใช้เป็น ground truth ตอนคิด recall */
let benchQueries: BenchQuery[] = [];
const benchQueriesById = new Map<string, BenchQuery>();

/**
 * คิด recall@5 / precision@5 / MRR **ฝั่ง server ด้วยสูตรเดียวกับ `bench.ts` เป๊ะ**
 * ตั้งใจไม่ให้ frontend คำนวณเอง เพราะถ้าสูตรสองฝั่งเพี้ยนกันแม้นิดเดียว ตัวเลขที่ UI โชว์
 * จะไม่ตรงกับตัวเลขใน README ของ workshop แล้วผู้เรียนจะเชื่อตัวไหนไม่ได้เลย
 */
function evaluateAgainstGroundTruth(
  results: ResultPayload[],
  relevant: string[]
): { relevant: string[]; recallAt5: number; precisionAt5: number; mrr: number } {
  const relevantSet = new Set(relevant);
  const returned = results.map((r) => r.id);
  const top5 = returned.slice(0, TOP_K);
  const hits = top5.filter((id) => relevantSet.has(id)).length;
  const firstHitIndex = returned.findIndex((id) => relevantSet.has(id));

  return {
    relevant,
    recallAt5: relevantSet.size === 0 ? 0 : hits / relevantSet.size,
    precisionAt5: hits / TOP_K,
    mrr: firstHitIndex === -1 ? 0 : 1 / (firstHitIndex + 1),
  };
}

/**
 * diagnostic method ที่อยู่นอก SearchBackend interface (getLastRouting/getLastSearchTiming)
 * — ตรวจแบบ duck-typing แทนการ import class มา instanceof เพื่อไม่ให้ serve.ts ผูกกับ
 * implementation ของ backend ตัวใดตัวหนึ่ง (backend ใหม่ที่มี method ชื่อเดียวกันจะใช้ได้ทันที)
 */
interface RoutingInfo {
  mode: string;
  ruleId: string;
  backendsQueried: string[];
}

interface VectorTiming {
  embedQueryMs: number;
  searchMs: number;
}

interface FusionContribution {
  noteId: string;
  perBackend: { backend: string; rank: number; contribution: number }[];
  total: number;
}

function readRouting(backend: SearchBackend): RoutingInfo | undefined {
  const fn = (backend as { getLastRouting?: () => RoutingInfo | undefined }).getLastRouting;
  return typeof fn === "function" ? fn.call(backend) : undefined;
}

function readFusion(backend: SearchBackend): FusionContribution[] | undefined {
  const fn = (backend as { getLastFusion?: () => FusionContribution[] | undefined }).getLastFusion;
  return typeof fn === "function" ? fn.call(backend) : undefined;
}

function readVectorTiming(backend: SearchBackend): VectorTiming | undefined {
  const fn = (backend as { getLastSearchTiming?: () => VectorTiming | undefined }).getLastSearchTiming;
  return typeof fn === "function" ? fn.call(backend) : undefined;
}

function extractTitle(content: string): string {
  const line = content.split("\n").find((l) => /^#\s+/.test(l));
  return line ? line.replace(/^#\s+/, "").trim() : "";
}

function buildExcerpt(content: string, maxChars = 180): string {
  // ตัดหัวข้อ H1 กับบรรทัดว่างออกก่อน เพื่อไม่ให้ทุก excerpt ขึ้นต้นเหมือนกันหมด
  const body = content
    .split("\n")
    .filter((l) => !/^#\s+/.test(l) && l.trim().length > 0)
    .join(" ")
    .trim();
  return body.length > maxChars ? `${body.slice(0, maxChars)}…` : body;
}

interface ResultPayload {
  id: string;
  title: string;
  layer: Layer;
  tags: string[];
  score: number;
  matchedBy: SearchResult["matchedBy"];
  excerpt: string;
}

function toPayload(result: SearchResult): ResultPayload {
  return {
    id: result.note.id,
    title: extractTitle(result.note.content),
    layer: result.note.layer,
    tags: result.note.tags,
    score: result.score,
    matchedBy: result.matchedBy,
    excerpt: buildExcerpt(result.note.content),
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)]!;
}

function isLayer(value: string): value is Layer {
  return (LAYERS as readonly string[]).includes(value);
}

/** แปลง query string เป็น SearchQuery — exactOptionalPropertyTypes บังคับให้ห้ามใส่ key ที่เป็น undefined */
function buildSearchQuery(params: URLSearchParams): SearchQuery {
  const text = params.get("q") ?? "";
  const limitRaw = params.get("limit");
  const limit = limitRaw === null ? DEFAULT_LIMIT : Number(limitRaw);

  const query: SearchQuery = { text, limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT };

  const layer = params.get("layer");
  if (layer !== null && layer.length > 0) {
    if (!isLayer(layer)) throw new HttpError(400, `layer ไม่ถูกต้อง: "${layer}" (ต้องเป็นหนึ่งใน ${LAYERS.join(", ")})`);
    query.layer = layer;
  }

  const tagsRaw = params.get("tags");
  if (tagsRaw !== null && tagsRaw.trim().length > 0) {
    query.tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  return query;
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

interface SearchResponse {
  backend: string;
  query: SearchQuery;
  engineMs: number;
  results: ResultPayload[];
  routedBy?: string;
  routingReason?: string;
  timing?: VectorTiming;
  fusion?: FusionContribution[];
  groundTruth?: { relevant: string[]; recallAt5: number; precisionAt5: number; mrr: number };
  repeat?: { runs: number; p50Ms: number; p95Ms: number };
}

async function handleSearch(params: URLSearchParams): Promise<SearchResponse> {
  const backendName = params.get("backend");
  if (backendName === null) throw new HttpError(400, "ต้องระบุ ?backend=");

  const backend = backendsByName.get(backendName);
  if (!backend) {
    throw new HttpError(404, `ไม่พบ backend "${backendName}" — ที่มีอยู่: ${[...backendsByName.keys()].join(", ")}`);
  }

  const query = buildSearchQuery(params);
  if (query.text.trim().length === 0) throw new HttpError(400, "ต้องระบุ ?q= ที่ไม่ว่าง");

  // จับเวลา "รอบ backend.search() เท่านั้น" — ไม่รวม JSON serialize/HTTP/render
  // ถ้ารวมเข้าไปด้วย ตัวเลขของ fts5 (0.06ms) จะถูก overhead กลบจนดูเท่ากับ ripgrep
  const start = performance.now();
  const results = await backend.search(query);
  const engineMs = performance.now() - start;

  const response: SearchResponse = {
    backend: backend.name,
    query,
    engineMs,
    results: results.map(toPayload),
  };

  const routing = readRouting(backend);
  if (routing) {
    response.routedBy = routing.ruleId;
    const rule = CLASSIFICATION_RULES.find((r) => r.id === routing.ruleId);
    if (rule) response.routingReason = rule.reason;
  }

  const timing = readVectorTiming(backend);
  if (timing) response.timing = timing;

  const fusion = readFusion(backend);
  if (fusion) response.fusion = fusion;

  const queryId = params.get("queryId");
  if (queryId !== null) {
    const benchQuery = benchQueriesById.get(queryId);
    if (!benchQuery) throw new HttpError(404, `ไม่พบ queryId "${queryId}" ใน bench/queries.json`);
    response.groundTruth = evaluateAgainstGroundTruth(response.results, benchQuery.relevant);
  }

  const repeatRaw = params.get("repeat");
  if (repeatRaw !== null) {
    const runs = Number(repeatRaw);
    if (!Number.isFinite(runs) || runs < 1) throw new HttpError(400, `repeat ต้องเป็นจำนวนเต็มบวก ได้รับ "${repeatRaw}"`);
    const latencies: number[] = [];
    for (let i = 0; i < WARMUP_ROUNDS; i++) await backend.search(query);
    for (let i = 0; i < runs; i++) {
      const t0 = performance.now();
      await backend.search(query);
      latencies.push(performance.now() - t0);
    }
    latencies.sort((a, b) => a - b);
    response.repeat = { runs, p50Ms: percentile(latencies, 50), p95Ms: percentile(latencies, 95) };
  }

  return response;
}

async function handleBackends(): Promise<unknown> {
  const rows = await Promise.all(
    registeredBackends.map(async (b) => ({ name: b.name, stats: await b.stats() }))
  );
  return { backends: rows };
}

function handleQueries(): unknown {
  return { queries: benchQueries };
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    // frontend รันคนละ port (Next dev = 3000, ตัวนี้ = 4000) จึงต้องเปิด CORS
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" });
    res.end();
    return;
  }

  try {
    switch (url.pathname) {
      case "/api/search":
        sendJson(res, 200, await handleSearch(url.searchParams));
        return;
      case "/api/backends":
        sendJson(res, 200, await handleBackends());
        return;
      case "/api/queries":
        sendJson(res, 200, handleQueries());
        return;
      default:
        sendJson(res, 404, { error: `ไม่พบ path "${url.pathname}"` });
        return;
    }
  } catch (err) {
    if (err instanceof HttpError) {
      sendJson(res, err.status, { error: err.message });
      return;
    }
    console.error("[serve] unhandled error:", err);
    sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
  }
}

/**
 * Warm-up ก่อนเปิดรับ request แรก — ไม่ใช่ optimization แต่เป็นความถูกต้องของตัวเลข
 * W3-1 พบว่า single-query embed ครั้งแรกหลัง index() ใช้เวลา ~1,250ms เพราะ ONNX
 * compile execution graph ตาม input shape ใหม่ (batch=1 ที่ยังไม่เคยเห็น) ถ้าไม่ warm
 * ผู้ใช้คนแรกจะเห็น vector ช้ากว่าความจริงเกือบ 100 เท่า แล้วสรุปผิดทันที
 */
async function warmUp(notes: MemoryNote[]): Promise<void> {
  const stats = vaultStats(notes);
  console.log(`Vault: ${stats.count} notes, ${stats.totalBytes} bytes, ~${stats.totalWords} words`);

  for (const backend of registeredBackends) {
    const t0 = performance.now();
    await backend.index(notes);
    console.log(`  index ${backend.name.padEnd(13)} ${(performance.now() - t0).toFixed(1)}ms`);
  }

  console.log("warm-up query (ดูดซับต้นทุน ONNX graph compile ของ vector)...");
  for (const backend of registeredBackends) {
    const t0 = performance.now();
    await backend.search({ text: "warm up คืนเงิน refund", limit: 5 });
    console.log(`  warm  ${backend.name.padEnd(13)} ${(performance.now() - t0).toFixed(1)}ms`);
  }
}

async function main(): Promise<void> {
  benchQueries = JSON.parse(await readFile(QUERIES_PATH, "utf-8")) as BenchQuery[];
  for (const q of benchQueries) benchQueriesById.set(q.id, q);
  console.log(`Ground truth: ${benchQueries.length} queries จาก bench/queries.json`);

  const notes = await readVault(VAULT_DIR);
  await warmUp(notes);

  const server = createServer((req, res) => {
    void route(req, res);
  });

  server.listen(PORT, () => {
    console.log(`\nพร้อมใช้งาน: http://localhost:${PORT}`);
    console.log(`  GET /api/search?backend=<name>&q=<query>[&layer=&tags=&limit=&repeat=]`);
    console.log(`  GET /api/backends   GET /api/queries`);
    console.log(`  backend ที่ลงทะเบียน: ${[...backendsByName.keys()].join(", ")}`);
  });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
