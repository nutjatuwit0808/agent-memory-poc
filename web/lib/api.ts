// Type สะท้อน response ของ src/cli/serve.ts — คัดลอกไว้ที่นี่ตั้งใจ ไม่ import จาก src/
// เพราะ web/ ต้องไม่ผูกกับโค้ดฝั่ง engine เลย (D-7: แยก process, คุยกันผ่าน HTTP เท่านั้น)

export const API_BASE = process.env.NEXT_PUBLIC_SEARCH_API ?? "http://localhost:4000";

export const BACKEND_NAMES = ["ripgrep", "fts5", "vector", "router-route", "router-fuse"] as const;
export type BackendName = (typeof BACKEND_NAMES)[number];

export const LAYERS = ["convention", "structure", "business-logic", "deployment", "support-case"] as const;

export interface ResultPayload {
  id: string;
  title: string;
  layer: string;
  tags: string[];
  score: number;
  matchedBy: "keyword" | "fts" | "vector";
  excerpt: string;
}

export interface FusionContribution {
  noteId: string;
  perBackend: { backend: string; rank: number; contribution: number }[];
  total: number;
}

export interface SearchResponse {
  backend: string;
  engineMs: number;
  results: ResultPayload[];
  routedBy?: string;
  routingReason?: string;
  timing?: { embedQueryMs: number; searchMs: number };
  fusion?: FusionContribution[];
  groundTruth?: { relevant: string[]; recallAt5: number; precisionAt5: number; mrr: number };
}

export interface BenchQuery {
  id: string;
  text: string;
  kind: "exact" | "keyword" | "semantic" | "filtered";
  layer: string | null;
  relevant: string[];
}

export interface SearchParams {
  q: string;
  layer?: string;
  tags?: string;
  queryId?: string;
  limit?: number;
}

/** ผลลัพธ์ที่ UI ถือไว้ต่อ 1 backend — roundTripMs วัดฝั่ง browser, engineMs มาจาก server */
export interface ColumnState {
  status: "idle" | "loading" | "done" | "error";
  data?: SearchResponse;
  roundTripMs?: number;
  error?: string;
}

export async function search(
  backend: BackendName,
  params: SearchParams,
  signal: AbortSignal
): Promise<{ data: SearchResponse; roundTripMs: number }> {
  const url = new URL("/api/search", API_BASE);
  url.searchParams.set("backend", backend);
  url.searchParams.set("q", params.q);
  if (params.layer) url.searchParams.set("layer", params.layer);
  if (params.tags) url.searchParams.set("tags", params.tags);
  if (params.queryId) url.searchParams.set("queryId", params.queryId);
  url.searchParams.set("limit", String(params.limit ?? 10));

  // วัด round-trip ฝั่ง browser — จะรวม HTTP + JSON parse เข้ามาด้วยเสมอ
  // ตัวเลขนี้ใหญ่กว่า engineMs ของ fts5 หลายร้อยเท่า จึงต้องแสดงแยกกันไม่ให้เข้าใจผิด
  const started = performance.now();
  const res = await fetch(url, { signal });
  const body = (await res.json()) as SearchResponse & { error?: string };
  const roundTripMs = performance.now() - started;

  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return { data: body, roundTripMs };
}

export async function fetchBenchQueries(): Promise<BenchQuery[]> {
  const res = await fetch(new URL("/api/queries", API_BASE));
  if (!res.ok) throw new Error(`โหลด queries ไม่สำเร็จ: HTTP ${res.status}`);
  const body = (await res.json()) as { queries: BenchQuery[] };
  return body.queries;
}
