import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { z } from "zod";
import { LAYERS } from "../core/frontmatter.js";
import { readVault, vaultStats } from "../core/vault-reader.js";
import type { MemoryNote, SearchQuery } from "../core/types.js";
import type { SearchBackend } from "../search/backend.interface.js";
import { backends as registeredBackends } from "../search/backends/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const VAULT_DIR = join(PROJECT_ROOT, "vault");
const QUERIES_PATH = join(PROJECT_ROOT, "bench", "queries.json");
const DATA_DIR = join(PROJECT_ROOT, "data");

const WARMUP_ROUNDS = 3;
const MEASURED_ROUNDS = 20;
const TOP_K = 5;
const SEARCH_LIMIT = 10;

const queryKindSchema = z.enum(["exact", "keyword", "semantic", "filtered", "multi-hop"]);

const querySchema = z.object({
  id: z.string(),
  text: z.string(),
  kind: queryKindSchema,
  layer: z.union([z.enum(LAYERS), z.null()]),
  relevant: z.array(z.string()).min(1),
});

type BenchQuery = z.infer<typeof querySchema>;

const querySetSchema = z.array(querySchema).min(1);

async function loadQueries(): Promise<BenchQuery[]> {
  const raw = await readFile(QUERIES_PATH, "utf-8");
  const parsed: unknown = JSON.parse(raw);
  const result = querySetSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`[bench] bench/queries.json ไม่ผ่าน schema: ${result.error.message}`);
  }
  return result.data;
}

function validateGroundTruth(queries: BenchQuery[], notes: MemoryNote[]): void {
  const noteIds = new Set(notes.map((n) => n.id));
  const problems: string[] = [];
  for (const q of queries) {
    for (const relevantId of q.relevant) {
      if (!noteIds.has(relevantId)) {
        problems.push(`query "${q.id}" อ้างถึง note "${relevantId}" ที่ไม่มีอยู่จริงใน vault`);
      }
    }
  }
  if (problems.length > 0) {
    throw new Error(`[bench] ground truth ไม่ถูกต้อง:\n${problems.join("\n")}`);
  }
}

function toSearchQuery(q: BenchQuery): SearchQuery {
  const base: SearchQuery = { text: q.text, limit: SEARCH_LIMIT };
  return q.layer === null ? base : { ...base, layer: q.layer };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)]!;
}

interface QualityMetrics {
  recallAt5: number;
  precisionAt5: number;
  mrr: number;
}

function evaluateQuality(queries: BenchQuery[], resultsByQuery: Map<string, string[]>): QualityMetrics {
  let recallSum = 0;
  let precisionSum = 0;
  let mrrSum = 0;

  for (const q of queries) {
    const returned = resultsByQuery.get(q.id) ?? [];
    const relevantSet = new Set(q.relevant);
    const top5 = returned.slice(0, TOP_K);

    const hitsInTop5 = top5.filter((id) => relevantSet.has(id)).length;
    recallSum += hitsInTop5 / relevantSet.size;
    precisionSum += hitsInTop5 / TOP_K;

    const firstHitIndex = returned.findIndex((id) => relevantSet.has(id));
    mrrSum += firstHitIndex === -1 ? 0 : 1 / (firstHitIndex + 1);
  }

  return {
    recallAt5: recallSum / queries.length,
    precisionAt5: precisionSum / queries.length,
    mrr: mrrSum / queries.length,
  };
}

interface BenchRow {
  backend: string;
  p50Ms: number;
  p95Ms: number;
  recallAt5: number;
  precisionAt5: number;
  mrr: number;
  indexedCount: number;
  sizeBytes: number;
  buildTimeMs: number;
}

async function benchBackend(backend: SearchBackend, notes: MemoryNote[], queries: BenchQuery[]): Promise<BenchRow> {
  await backend.index(notes);
  const stats = await backend.stats();

  // Quality: เก็บผลจาก round แรกของการวัด latency ด้านล่าง ไม่ยิงซ้ำเพิ่ม
  const resultsByQuery = new Map<string, string[]>();
  const latenciesMs: number[] = [];

  for (let round = 0; round < WARMUP_ROUNDS; round++) {
    for (const q of queries) {
      await backend.search(toSearchQuery(q));
    }
  }

  for (let round = 0; round < MEASURED_ROUNDS; round++) {
    for (const q of queries) {
      const start = performance.now();
      const results = await backend.search(toSearchQuery(q));
      const elapsed = performance.now() - start;
      latenciesMs.push(elapsed);

      if (round === 0) {
        resultsByQuery.set(
          q.id,
          results.map((r) => r.note.id)
        );
      }
    }
  }

  latenciesMs.sort((a, b) => a - b);
  const quality = evaluateQuality(queries, resultsByQuery);

  return {
    backend: backend.name,
    p50Ms: percentile(latenciesMs, 50),
    p95Ms: percentile(latenciesMs, 95),
    recallAt5: quality.recallAt5,
    precisionAt5: quality.precisionAt5,
    mrr: quality.mrr,
    indexedCount: stats.indexedCount,
    sizeBytes: stats.sizeBytes,
    buildTimeMs: stats.buildTimeMs,
  };
}

function formatMarkdownTable(rows: BenchRow[]): string {
  const header = "| backend | p50 (ms) | p95 (ms) | recall@5 | precision@5 | MRR | indexed | size (bytes) | build (ms) |";
  const separator = "|---|---|---|---|---|---|---|---|---|";
  if (rows.length === 0) {
    return `${header}\n${separator}\n| _(ยังไม่มี backend ลงทะเบียน)_ | | | | | | | | |`;
  }
  const lines = rows.map(
    (r) =>
      `| ${r.backend} | ${r.p50Ms.toFixed(2)} | ${r.p95Ms.toFixed(2)} | ${r.recallAt5.toFixed(2)} | ${r.precisionAt5.toFixed(2)} | ${r.mrr.toFixed(2)} | ${r.indexedCount} | ${r.sizeBytes} | ${r.buildTimeMs.toFixed(2)} |`
  );
  return [header, separator, ...lines].join("\n");
}

function parseBackendFlag(argv: string[]): string | undefined {
  const flag = argv.find((a) => a.startsWith("--backend="));
  return flag ? flag.slice("--backend=".length) : undefined;
}

async function main(): Promise<void> {
  const backendFilter = parseBackendFlag(process.argv.slice(2));

  const notes = await readVault(VAULT_DIR);
  const stats = vaultStats(notes);
  console.log(
    `Vault: ${stats.count} notes, ${stats.totalBytes} bytes, ~${stats.totalWords} words (Thai-aware estimate)\n`
  );

  const queries = await loadQueries();
  validateGroundTruth(queries, notes);

  const selectedBackends = backendFilter
    ? registeredBackends.filter((b) => b.name === backendFilter)
    : registeredBackends;

  if (backendFilter && selectedBackends.length === 0) {
    throw new Error(
      `[bench] ไม่พบ backend ชื่อ "${backendFilter}" — ที่ลงทะเบียนไว้: ${registeredBackends.map((b) => b.name).join(", ") || "(ไม่มี)"}`
    );
  }

  const rows: BenchRow[] = [];
  for (const backend of selectedBackends) {
    rows.push(await benchBackend(backend, notes, queries));
  }

  console.log(formatMarkdownTable(rows));

  await mkdir(DATA_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = join(DATA_DIR, `bench-${timestamp}.json`);
  await writeFile(outPath, JSON.stringify({ vaultStats: stats, rows }, null, 2), "utf-8");
  console.log(`\nRaw results: ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
