import type { MemoryNote, SearchQuery, SearchResult } from "../core/types.js";
import type { SearchBackend } from "./backend.interface.js";

export interface ClassificationRule {
  id: string;
  /** เหตุผลต้องอ้างอิงตัวเลขจริงจาก WS01–03 เสมอ — ห้ามเป็นแค่ความรู้สึกว่า "น่าจะดี" */
  reason: string;
  backend: string;
  test: (query: SearchQuery) => boolean;
}

// ภาษาไทยไม่มีช่องว่างคั่นคำ — whitespace-split ตรงๆ จะนับประโยคไทยทั้งประโยคเป็น
// "1 คำ" เสมอ (เจอปัญหาเดียวกันนี้ซ้ำเป็นครั้งที่ 3 ในโปรเจกต์นี้ หลัง vault-reader.ts
// และ FTS5 tokenizer ใน WS02) ใช้ heuristic เดียวกับ vault-reader.ts: นับ run ของอักษร
// ไทยแยกต่างหาก (÷4 ตัวอักษร/คำโดยประมาณ) ไม่ import จาก core/ เพราะ core ต้อง freeze
// แล้ว (CLAUDE.md §2.4) จึงคัดลอก logic สั้นๆ มาไว้ที่นี่แทน
const THAI_RUN_RE = /[฀-๿]+/g;

function wordCount(text: string): number {
  const thaiRuns = text.match(THAI_RUN_RE) ?? [];
  const thaiCharCount = thaiRuns.reduce((sum, run) => sum + run.length, 0);
  const thaiWordEstimate = Math.ceil(thaiCharCount / 4);

  const nonThaiText = text.replace(THAI_RUN_RE, " ");
  const nonThaiWordCount = nonThaiText.split(/\s+/).filter((w) => w.length > 0).length;

  return thaiWordEstimate + nonThaiWordCount;
}

/** ดูเป็น identifier: ครอบ quote, มี _/-/. ติดกับตัวอักษร, หรือเป็นตัวพิมพ์ใหญ่ล้วน (เช่น ENV_VAR) */
function looksLikeIdentifier(text: string): boolean {
  const trimmed = text.trim();
  if (/^".*"$/.test(trimmed)) return true;
  if (/^[A-Z][A-Z0-9_]*$/.test(trimmed)) return true; // SCREAMING_SNAKE_CASE
  if (/^[a-zA-Z][a-zA-Z0-9]*[_.-][a-zA-Z0-9_.-]*$/.test(trimmed)) return true; // camelCase_with-dots.etc
  return false;
}

/**
 * กฎ routing แบบ deterministic ล้วนๆ (CLAUDE.md §2.1 — ห้าม LLM ตัดสินใจ) เรียงจาก
 * เฉพาะเจาะจงที่สุดไปกว้างที่สุด — query ที่เข้าได้หลายกฎจะไปตามกฎแรกที่ match เจอ
 *
 * ทุกกฎอ้างอิงตัวเลขจริงจาก WS01–03:
 * - identifier-like -> ripgrep: WS01 q-exact-* ทุกตัว recall@5 = 1.00 (literal substring ชนะขาด)
 *   ในขณะที่ vector (WS03) เจอแค่ recall 0.47 กับ query แบบนี้ เพราะ identifier ไม่มีความหมาย
 *   ทางภาษาที่ embedding จะจับได้
 * - short-keyword -> fts5: WS02 keyword recall@5 = 1.00 (ดีกว่า ripgrep 0.90 ด้วยซ้ำ) และเร็วกว่า
 *   ทุก backend อย่างขาดลอย (p50 0.06ms) เหมาะกับ query สั้นที่ token match ตรงไปตรงมา
 * - long-semantic -> vector: WS03 semantic recall@5 = 0.67 เทียบกับ ripgrep/fts5 ที่ 0.07 เท่ากันทั้งคู่
 *   query ยาว/เป็นประโยคมักสื่อว่าผู้ใช้พิมพ์ด้วยคำของตัวเอง ไม่ใช่คำที่ตรงกับเนื้อหาเป๊ะ
 */
export const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    id: "identifier-like",
    reason:
      'ครอบ "..." / SCREAMING_SNAKE_CASE / มี _ - . แบบ identifier -> ripgrep (WS01 q-exact-* recall@5=1.00, vector เหลือ 0.47)',
    backend: "ripgrep",
    test: (q) => looksLikeIdentifier(q.text),
  },
  {
    id: "short-keyword",
    reason: "1-3 คำ -> fts5 (WS02 keyword recall@5=1.00, p50=0.06ms เร็วสุดในสามตัว)",
    backend: "fts5",
    test: (q) => wordCount(q.text) <= 3,
  },
  {
    id: "long-semantic",
    reason: "≥4 คำ/ประโยคคำถาม -> vector (WS03 semantic recall@5=0.67 vs ripgrep/fts5 ที่ 0.07 เท่ากัน)",
    backend: "vector",
    test: () => true, // fallback สุดท้าย — ครอบทุก query ที่ไม่เข้ากฎก่อนหน้า
  },
];

/** คืนกฎแรกที่ query เข้าเงื่อนไข — เดินตามลำดับใน CLASSIFICATION_RULES เสมอ (deterministic 100%) */
export function classify(query: SearchQuery): ClassificationRule {
  for (const rule of CLASSIFICATION_RULES) {
    if (rule.test(query)) return rule;
  }
  // เข้าไม่ได้เลยไม่ควรเกิดขึ้น เพราะ long-semantic เป็น catch-all แต่กันไว้เผื่อแก้กฎผิดพลาดทีหลัง
  throw new Error(`[router] ไม่มีกฎไหนรับ query: "${query.text}"`);
}

const RRF_K = 60;

/**
 * Reciprocal Rank Fusion — รวม "อันดับ" ไม่ใช่ "คะแนนดิบ" เพราะคะแนนของแต่ละ backend
 * อยู่คนละสเปซกันเทียบกันตรงๆ ไม่ได้ (bm25 ติดลบไม่มีขอบเขต, cosine อยู่ 0-1, ripgrep
 * เป็นจำนวนเต็มนับ match) สูตร: score = Σ 1/(k + rank) โดย k=60 (ค่ามาตรฐานจากงานวิจัย
 * RRF ต้นฉบับ — ทำให้อันดับต้นๆ มีน้ำหนักสูงกว่าอันดับท้ายๆ แบบค่อยเป็นค่อยไป ไม่ให้อันดับ 1
 * ครอบงำมากเกินไปเหมือน 1/rank ตรงๆ)
 */
export function fuseRRF(resultSets: { backend: string; results: SearchResult[] }[], limit?: number): SearchResult[] {
  return fuseRRFWithBreakdown(resultSets, limit).results;
}

/** ที่มาของคะแนน RRF ของ note หนึ่งตัว — แยกทีละ backend ให้ตรวจสอบเลขตามด้วยมือได้ */
export interface FusionContribution {
  noteId: string;
  perBackend: { backend: string; rank: number; contribution: number }[];
  total: number;
}

/**
 * เหมือน `fuseRRF` ทุกประการ แต่คืน breakdown ของที่มาคะแนนมาด้วย — มีไว้ให้ UI/CLI
 * แสดงว่าคะแนนสุดท้ายประกอบมาจากอันดับไหนของ backend ใดบ้าง โดย**ไม่ต้องไปคำนวณสูตรซ้ำ
 * เองที่ฝั่งผู้เรียก** (ถ้าผู้เรียกคำนวณเอง เลขที่โชว์จะกลายเป็นเลขคนละชุดกับที่ router ใช้จริง)
 */
export function fuseRRFWithBreakdown(
  resultSets: { backend: string; results: SearchResult[] }[],
  limit?: number
): { results: SearchResult[]; breakdown: FusionContribution[] } {
  const scoreByNoteId = new Map<string, number>();
  const noteById = new Map<string, MemoryNote>();
  const matchedByNoteId = new Map<string, SearchResult["matchedBy"]>();
  const contributionsByNoteId = new Map<string, FusionContribution["perBackend"]>();

  for (const { backend, results } of resultSets) {
    results.forEach((r, index) => {
      const rank = index + 1;
      const rrfScore = 1 / (RRF_K + rank);
      scoreByNoteId.set(r.note.id, (scoreByNoteId.get(r.note.id) ?? 0) + rrfScore);
      noteById.set(r.note.id, r.note);
      if (!matchedByNoteId.has(r.note.id)) matchedByNoteId.set(r.note.id, r.matchedBy);

      const perBackend = contributionsByNoteId.get(r.note.id) ?? [];
      perBackend.push({ backend, rank, contribution: rrfScore });
      contributionsByNoteId.set(r.note.id, perBackend);
    });
  }

  const fused: SearchResult[] = Array.from(scoreByNoteId.entries()).map(([id, score]) => ({
    note: noteById.get(id)!,
    score,
    matchedBy: matchedByNoteId.get(id)!,
  }));

  fused.sort((a, b) => b.score - a.score);
  const limited = limit ? fused.slice(0, limit) : fused;

  const breakdown: FusionContribution[] = limited.map((r) => ({
    noteId: r.note.id,
    perBackend: contributionsByNoteId.get(r.note.id) ?? [],
    total: r.score,
  }));

  return { results: limited, breakdown };
}

export interface RouterOptions {
  name?: string;
  mode: "route" | "fuse";
  backends: Record<string, SearchBackend>;
}

interface LastRouting {
  mode: "route" | "fuse";
  ruleId: string;
  backendsQueried: string[];
}

/**
 * SearchBackend ที่ห่อ backend อื่นไว้ข้างใน — mode "route" เลือก backend เดียวตาม
 * CLASSIFICATION_RULES, mode "fuse" ยิงทุก backend พร้อมกันแล้วรวมด้วย RRF
 */
export class RouterBackend implements SearchBackend {
  readonly name: string;
  private readonly mode: "route" | "fuse";
  private readonly backends: Record<string, SearchBackend>;
  private lastRouting: LastRouting | undefined;
  private lastFusion: FusionContribution[] | undefined;

  constructor(options: RouterOptions) {
    this.name = options.name ?? `router-${options.mode}`;
    this.mode = options.mode;
    this.backends = options.backends;
  }

  async index(notes: MemoryNote[]): Promise<void> {
    await Promise.all(Object.values(this.backends).map((b) => b.index(notes)));
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    if (this.mode === "route") {
      const rule = classify(query);
      const backend = this.backends[rule.backend];
      if (!backend) throw new Error(`[router] ไม่พบ backend "${rule.backend}" ที่กฎ "${rule.id}" ต้องการ`);
      this.lastRouting = { mode: "route", ruleId: rule.id, backendsQueried: [rule.backend] };
      this.lastFusion = undefined;
      return backend.search(query);
    }

    const entries = Object.entries(this.backends);
    const resultSets = await Promise.all(
      entries.map(async ([name, backend]) => ({ backend: name, results: await backend.search(query) }))
    );
    this.lastRouting = { mode: "fuse", ruleId: "fuse-all", backendsQueried: entries.map(([name]) => name) };

    const { results, breakdown } = fuseRRFWithBreakdown(resultSets, query.limit);
    this.lastFusion = breakdown;
    return results;
  }

  /** diagnostic เท่านั้น ไม่อยู่ใน SearchBackend interface — ให้ log/ตรวจสอบว่า routedBy อะไร */
  getLastRouting(): LastRouting | undefined {
    return this.lastRouting;
  }

  /** diagnostic เท่านั้น — ที่มาของคะแนน RRF ครั้งล่าสุด (undefined ถ้าอยู่ mode "route") */
  getLastFusion(): FusionContribution[] | undefined {
    return this.lastFusion;
  }

  async stats(): Promise<{ indexedCount: number; sizeBytes: number; buildTimeMs: number }> {
    const allStats = await Promise.all(Object.values(this.backends).map((b) => b.stats()));
    return {
      indexedCount: Math.max(...allStats.map((s) => s.indexedCount), 0),
      sizeBytes: allStats.reduce((sum, s) => sum + s.sizeBytes, 0),
      buildTimeMs: allStats.reduce((sum, s) => sum + s.buildTimeMs, 0),
    };
  }
}
