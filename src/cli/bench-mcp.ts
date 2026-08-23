/**
 * W10-3 — วัดต้นทุนฝั่งเราเอง เทียบ 3 ชั้น: backend.search() ตรงๆ / HTTP ผ่าน serve.ts /
 * MCP tool call แล้วบวกการวัด cold start ของ stdio vs HTTP transport
 *
 * ไม่ผ่าน Cursor เลย (ตัดตัวแปร LLM ตัดสินใจเรียก tool เมื่อไหร่ออกไป) — spawn serve.ts
 * และ mcp.ts เป็น child process จริง วัดเวลาแบบ end-to-end จริงเหมือน bench.ts (warmup 3 +
 * วัด 20 รอบ) ไฟล์นี้ไม่แก้ serve.ts / mcp.ts เลย แค่เรียกจากภายนอกเหมือน client จริง
 */
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import type { Layer } from "../core/types.js";
import { readVault } from "../core/vault-reader.js";
import { backends as registeredBackends } from "../search/backends/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const VAULT_DIR = join(PROJECT_ROOT, "vault");
const QUERIES_PATH = join(PROJECT_ROOT, "bench", "queries.json");
const DATA_DIR = join(PROJECT_ROOT, "data");

const WARMUP_ROUNDS = 3;
const MEASURED_ROUNDS = 20; // เท่ากับ bench.ts เพื่อให้ตัวเลขชั้น engine เทียบกับ README WS01–04 ได้ตรงๆ
const BACKEND_NAME = "router-route"; // ตัวที่ mcp.ts ใช้เป็น default จริง (WS04: recall 0.87 ที่ latency เกือบต่ำสุด)
const SERVE_PORT = 4201;
const MCP_HTTP_PORT = 4202;
const COLDSTART_HTTP_PORT = 4203;

interface BenchQuery {
  id: string;
  text: string;
  kind: string;
  layer: Layer | null;
  relevant: string[];
}

async function loadQueries(): Promise<BenchQuery[]> {
  return JSON.parse(await readFile(QUERIES_PATH, "utf-8")) as BenchQuery[];
}

function toSearchQuery(q: BenchQuery) {
  const base = { text: q.text, limit: 10 };
  return q.layer === null ? base : { ...base, layer: q.layer };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)]!;
}

function overallStats(latenciesByQueryId: Map<string, number[]>): { p50: number; p95: number } {
  const all = [...latenciesByQueryId.values()].flat().sort((a, b) => a - b);
  return { p50: percentile(all, 50), p95: percentile(all, 95) };
}

function summarizeByKind(
  latenciesByQueryId: Map<string, number[]>,
  queries: BenchQuery[]
): Map<string, { p50: number; p95: number }> {
  const byKind = new Map<string, number[]>();
  for (const q of queries) {
    const bucket = byKind.get(q.kind) ?? [];
    bucket.push(...(latenciesByQueryId.get(q.id) ?? []));
    byKind.set(q.kind, bucket);
  }
  const result = new Map<string, { p50: number; p95: number }>();
  for (const [kind, latencies] of byKind) {
    const sorted = [...latencies].sort((a, b) => a - b);
    result.set(kind, { p50: percentile(sorted, 50), p95: percentile(sorted, 95) });
  }
  return result;
}

// ===== ชั้น 1: backend.search() ตรงๆ ในโปรเซสเดียวกัน ไม่มี transport ใดๆ =====

async function measureEngineLayer(queries: BenchQuery[]): Promise<Map<string, number[]>> {
  const notes = await readVault(VAULT_DIR);
  const backend = registeredBackends.find((b) => b.name === BACKEND_NAME);
  if (!backend) throw new Error(`[bench-mcp] ไม่พบ backend "${BACKEND_NAME}"`);
  await backend.index(notes);

  const latencies = new Map<string, number[]>(queries.map((q) => [q.id, []]));

  for (let round = 0; round < WARMUP_ROUNDS; round++) {
    for (const q of queries) await backend.search(toSearchQuery(q));
  }
  for (let round = 0; round < MEASURED_ROUNDS; round++) {
    for (const q of queries) {
      const t0 = performance.now();
      await backend.search(toSearchQuery(q));
      latencies.get(q.id)!.push(performance.now() - t0);
    }
  }
  return latencies;
}

// ===== ชั้น 2: HTTP ผ่าน serve.ts (WS05 วัดไว้แล้วว่า +HTTP/JSON ~15–20ms) =====

function spawnServeProcess(port: number): ChildProcessWithoutNullStreams {
  return spawn("node", ["--import", "tsx", "src/cli/serve.ts"], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PORT: String(port) },
  }) as ChildProcessWithoutNullStreams;
}

async function waitForHttp(url: string, maxWaitMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // ยังไม่พร้อม รอต่อ
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`[bench-mcp] รอ ${url} ไม่พร้อมภายใน ${maxWaitMs}ms`);
}

async function measureHttpServeLayer(queries: BenchQuery[]): Promise<Map<string, number[]>> {
  const latencies = new Map<string, number[]>(queries.map((q) => [q.id, []]));

  const call = async (q: BenchQuery): Promise<number> => {
    const params = new URLSearchParams({ backend: BACKEND_NAME, q: q.text, limit: "10" });
    if (q.layer !== null) params.set("layer", q.layer);
    const t0 = performance.now();
    const res = await fetch(`http://localhost:${SERVE_PORT}/api/search?${params.toString()}`);
    await res.json();
    return performance.now() - t0;
  };

  for (let round = 0; round < WARMUP_ROUNDS; round++) {
    for (const q of queries) await call(q);
  }
  for (let round = 0; round < MEASURED_ROUNDS; round++) {
    for (const q of queries) latencies.get(q.id)!.push(await call(q));
  }
  return latencies;
}

// ===== ชั้น 3: MCP tool call ผ่าน HTTP transport =====

function spawnMcpHttpProcess(port: number): ChildProcessWithoutNullStreams {
  return spawn("node", ["--import", "tsx", "src/cli/mcp.ts", "--http", `--port=${port}`], {
    cwd: PROJECT_ROOT,
  }) as ChildProcessWithoutNullStreams;
}

let rpcId = 1;

async function mcpToolCall(port: number, name: string, args: Record<string, unknown>): Promise<unknown> {
  const id = rpcId++;
  const res = await fetch(`http://localhost:${port}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } }),
  });
  return res.json();
}

async function waitForMcpHttpReady(port: number, maxWaitMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`http://localhost:${port}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 0, method: "tools/list" }),
      });
      if (res.ok) return;
    } catch {
      // ยังไม่พร้อม รอต่อ
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`[bench-mcp] mcp http port ${port} ไม่พร้อมภายใน ${maxWaitMs}ms`);
}

function searchArgs(q: BenchQuery): Record<string, unknown> {
  const args: Record<string, unknown> = { query: q.text, backend: BACKEND_NAME, limit: 10 };
  if (q.layer !== null) args.layer = q.layer;
  return args;
}

async function measureMcpHttpLayer(queries: BenchQuery[]): Promise<Map<string, number[]>> {
  const latencies = new Map<string, number[]>(queries.map((q) => [q.id, []]));

  // เรียกครั้งแรกแยกต่างหากดูดซับ warm-up (index ทุก backend + ONNX compile) ไม่ให้ปนกับตัวเลขที่วัด
  await mcpToolCall(MCP_HTTP_PORT, "search_memory", searchArgs(queries[0]!));

  const call = async (q: BenchQuery): Promise<number> => {
    const t0 = performance.now();
    await mcpToolCall(MCP_HTTP_PORT, "search_memory", searchArgs(q));
    return performance.now() - t0;
  };

  for (let round = 0; round < WARMUP_ROUNDS; round++) {
    for (const q of queries) await call(q);
  }
  for (let round = 0; round < MEASURED_ROUNDS; round++) {
    for (const q of queries) latencies.get(q.id)!.push(await call(q));
  }
  return latencies;
}

// ===== Cold start: stdio (spawn ใหม่ทุกครั้ง) vs HTTP (spawn ครั้งเดียว ใช้ซ้ำได้) =====

interface StdioResponse {
  id?: number;
}

function sendStdioMessage(proc: ChildProcessWithoutNullStreams, msg: Record<string, unknown>): void {
  proc.stdin.write(`${JSON.stringify(msg)}\n`);
}

function waitForStdioResponse(proc: ChildProcessWithoutNullStreams, id: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const rl = createInterface({ input: proc.stdout });
    const timeout = setTimeout(() => {
      rl.close();
      reject(new Error(`[bench-mcp] stdio ไม่ตอบ id=${id} ภายใน 30s`));
    }, 30000);
    rl.on("line", (line) => {
      if (line.trim().length === 0) return;
      let parsed: StdioResponse;
      try {
        parsed = JSON.parse(line) as StdioResponse;
      } catch {
        return;
      }
      if (parsed.id === id) {
        clearTimeout(timeout);
        rl.close();
        resolve(parsed);
      }
    });
  });
}

/** เวลาตั้งแต่ spawn process ใหม่ จน initialize + tools/call แรก (ค้น query จริง) ตอบกลับ */
async function measureColdStartStdio(query: BenchQuery): Promise<number> {
  const t0 = performance.now();
  const proc = spawn("node", ["--import", "tsx", "src/cli/mcp.ts"], { cwd: PROJECT_ROOT }) as ChildProcessWithoutNullStreams;

  try {
    sendStdioMessage(proc, { jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await waitForStdioResponse(proc, 1);
    sendStdioMessage(proc, { jsonrpc: "2.0", method: "notifications/initialized" });

    sendStdioMessage(proc, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "search_memory", arguments: searchArgs(query) },
    });
    await waitForStdioResponse(proc, 2);

    return performance.now() - t0;
  } finally {
    proc.kill();
  }
}

/**
 * HTTP: spawn ครั้งเดียว วัด "ครั้งแรก" (จ่ายต้นทุน warm-up) แล้ววัด "ครั้งที่สอง" บน
 * process เดิมที่อุ่นแล้ว — จำลอง Cursor เปิดใหม่แต่ server ยังรันค้างอยู่ (ไม่ต้อง spawn ซ้ำ)
 */
async function measureColdStartHttp(query: BenchQuery): Promise<{ firstCallMs: number; secondCallMs: number }> {
  const t0 = performance.now();
  const proc = spawnMcpHttpProcess(COLDSTART_HTTP_PORT);

  try {
    await waitForMcpHttpReady(COLDSTART_HTTP_PORT);
    await mcpToolCall(COLDSTART_HTTP_PORT, "search_memory", searchArgs(query));
    const firstCallMs = performance.now() - t0;

    const t1 = performance.now();
    await mcpToolCall(COLDSTART_HTTP_PORT, "search_memory", searchArgs(query));
    const secondCallMs = performance.now() - t1;

    return { firstCallMs, secondCallMs };
  } finally {
    proc.kill();
  }
}

// ===== output =====

function formatLayerKindTable(
  kinds: string[],
  engine: Map<string, { p50: number; p95: number }>,
  http: Map<string, { p50: number; p95: number }>,
  mcp: Map<string, { p50: number; p95: number }>
): string {
  const header = "| kind | engine p50 (ms) | HTTP serve.ts p50 (ms) | MCP tool call p50 (ms) |";
  const sep = "|---|---|---|---|";
  const zero = { p50: 0, p95: 0 };
  const lines = kinds.map((k) => {
    const e = engine.get(k) ?? zero;
    const h = http.get(k) ?? zero;
    const m = mcp.get(k) ?? zero;
    return `| ${k} | ${e.p50.toFixed(2)} | ${h.p50.toFixed(2)} | ${m.p50.toFixed(2)} |`;
  });
  return [header, sep, ...lines].join("\n");
}

function mapToObject(m: Map<string, { p50: number; p95: number }>): Record<string, { p50: number; p95: number }> {
  return Object.fromEntries(m);
}

async function main(): Promise<void> {
  const queries = await loadQueries();
  const kinds = [...new Set(queries.map((q) => q.kind))];

  console.log("== ชั้น 1: backend.search() ตรงๆ ==");
  const engineLatencies = await measureEngineLayer(queries);
  const engineOverall = overallStats(engineLatencies);
  console.log(`  overall p50=${engineOverall.p50.toFixed(2)}ms p95=${engineOverall.p95.toFixed(2)}ms`);

  console.log("\n== ชั้น 2: HTTP ผ่าน serve.ts ==");
  const serveProc = spawnServeProcess(SERVE_PORT);
  await waitForHttp(`http://localhost:${SERVE_PORT}/api/backends`);
  const httpLatencies = await measureHttpServeLayer(queries);
  serveProc.kill();
  const httpOverall = overallStats(httpLatencies);
  console.log(`  overall p50=${httpOverall.p50.toFixed(2)}ms p95=${httpOverall.p95.toFixed(2)}ms`);

  console.log("\n== ชั้น 3: MCP tool call (HTTP transport) ==");
  const mcpProc = spawnMcpHttpProcess(MCP_HTTP_PORT);
  await waitForMcpHttpReady(MCP_HTTP_PORT);
  const mcpLatencies = await measureMcpHttpLayer(queries);
  mcpProc.kill();
  const mcpOverall = overallStats(mcpLatencies);
  console.log(`  overall p50=${mcpOverall.p50.toFixed(2)}ms p95=${mcpOverall.p95.toFixed(2)}ms`);

  const mcpOverheadMs = mcpOverall.p50 - httpOverall.p50;
  const mcpOverheadPct = (mcpOverheadMs / mcpOverall.p50) * 100;

  console.log("\n== ตาราง: p50 ต่อ query kind ต่อชั้น ==");
  const engineByKind = summarizeByKind(engineLatencies, queries);
  const httpByKind = summarizeByKind(httpLatencies, queries);
  const mcpByKind = summarizeByKind(mcpLatencies, queries);
  console.log(formatLayerKindTable(kinds, engineByKind, httpByKind, mcpByKind));

  console.log(
    `\nMCP overhead ล้วนๆ (ชั้น3 - ชั้น2): ${mcpOverheadMs.toFixed(2)}ms = ${mcpOverheadPct.toFixed(1)}% ของ round-trip ทั้งหมด`
  );

  console.log("\n== Cold start: stdio vs HTTP ==");
  const stdioColdMs = await measureColdStartStdio(queries[0]!);
  console.log(`  stdio (spawn ใหม่ + handshake + search_memory แรก): ${stdioColdMs.toFixed(1)}ms`);

  const httpCold = await measureColdStartHttp(queries[0]!);
  console.log(`  http  (spawn ใหม่ + search_memory แรก, ต้นทุนครั้งเดียว): ${httpCold.firstCallMs.toFixed(1)}ms`);
  console.log(`  http  (เรียกซ้ำบน process เดิมที่อุ่นแล้ว, steady state): ${httpCold.secondCallMs.toFixed(1)}ms`);

  await mkdir(DATA_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = join(DATA_DIR, `bench-mcp-${timestamp}.json`);
  await writeFile(
    outPath,
    JSON.stringify(
      {
        engineOverall,
        httpOverall,
        mcpOverall,
        mcpOverheadMs,
        mcpOverheadPct,
        byKind: { engine: mapToObject(engineByKind), http: mapToObject(httpByKind), mcp: mapToObject(mcpByKind) },
        coldStart: { stdioMs: stdioColdMs, httpFirstMs: httpCold.firstCallMs, httpSecondMs: httpCold.secondCallMs },
      },
      null,
      2
    ),
    "utf-8"
  );
  console.log(`\nRaw results: ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
