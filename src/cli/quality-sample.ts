/**
 * W10-4 — ฝั่ง MCP (อัตโนมัติ) ของการเทียบคุณภาพกับ Cursor indexing
 *
 * เลือก 10 query จาก bench/queries.json (2 ต่อ kind ครบทั้ง 5 kind) แล้วรัน router-route
 * (backend default ของ mcp.ts จริง) หาผลลัพธ์ top-5 พร้อมคิด recall@5 — เอาผลนี้ไปวางคู่กับ
 * สิ่งที่ Cursor ตอบในแชทตอนเปิดโฟลเดอร์ที่มีแค่ vault/ (ทำมือ บันทึกแยกใน README ของ workshop)
 *
 * เกณฑ์เลือก 10 ข้อ: ครบทุก kind (exact/keyword/semantic/filtered/multi-hop) ข้อละ 2 —
 * เลือกแบบ deterministic (2 ตัวแรกของแต่ละ kind ตามลำดับใน queries.json) ไม่ใช่สุ่ม เพื่อให้รันซ้ำได้ผลเดิม
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Layer, MemoryNote } from "../core/types.js";
import { readVault } from "../core/vault-reader.js";
import { backends as registeredBackends } from "../search/backends/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const VAULT_DIR = join(PROJECT_ROOT, "vault");
const QUERIES_PATH = join(PROJECT_ROOT, "bench", "queries.json");

const BACKEND_NAME = "router-route";
const TOP_K = 5;

interface BenchQuery {
  id: string;
  text: string;
  kind: string;
  layer: Layer | null;
  relevant: string[];
}

function pickTenById(queries: BenchQuery[]): BenchQuery[] {
  const byKind = new Map<string, BenchQuery[]>();
  for (const q of queries) {
    const bucket = byKind.get(q.kind) ?? [];
    bucket.push(q);
    byKind.set(q.kind, bucket);
  }
  const picked: BenchQuery[] = [];
  for (const [, bucket] of byKind) picked.push(...bucket.slice(0, 2));
  return picked;
}

async function main(): Promise<void> {
  const notes: MemoryNote[] = await readVault(VAULT_DIR);
  const queries: BenchQuery[] = JSON.parse(await readFile(QUERIES_PATH, "utf-8"));
  const sample = pickTenById(queries);

  const backend = registeredBackends.find((b) => b.name === BACKEND_NAME);
  if (!backend) throw new Error(`[quality-sample] ไม่พบ backend "${BACKEND_NAME}"`);
  await backend.index(notes);

  console.log(`backend: ${BACKEND_NAME} | sample: ${sample.length} query (2 ต่อ kind)\n`);

  let recallSum = 0;
  const rows: { id: string; kind: string; text: string; recallAt5: number; top5: string[]; relevant: string[] }[] = [];

  for (const q of sample) {
    const query = q.layer === null ? { text: q.text, limit: TOP_K } : { text: q.text, layer: q.layer, limit: TOP_K };
    const results = await backend.search(query);
    const top5 = results.map((r) => r.note.id);
    const relevantSet = new Set(q.relevant);
    const hits = top5.filter((id) => relevantSet.has(id)).length;
    const recallAt5 = hits / relevantSet.size;
    recallSum += recallAt5;

    rows.push({ id: q.id, kind: q.kind, text: q.text, recallAt5, top5, relevant: q.relevant });
  }

  for (const r of rows) {
    console.log(`[${r.kind}] ${r.id} — "${r.text}"`);
    console.log(`  ground truth: ${r.relevant.join(", ")}`);
    console.log(`  top-5 คืนมา : ${r.top5.join(", ") || "(ไม่มีผลลัพธ์)"}`);
    console.log(`  recall@5    : ${r.recallAt5.toFixed(2)}\n`);
  }

  console.log(`recall@5 เฉลี่ยของ 10 query นี้ (ฝั่ง MCP/router-route): ${(recallSum / rows.length).toFixed(3)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
