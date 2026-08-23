import { performance } from "node:perf_hooks";
import type { MemoryNote, SearchQuery, SearchResult } from "../../core/types.js";
import type { SearchBackend } from "../backend.interface.js";
import { rerank } from "./reranker.js";

export interface RerankBackendOptions {
  name?: string;
  /** backend ที่คัด candidate กว้างๆ มาให้ก่อน (stage 1) */
  innerBackend: SearchBackend;
  /** จำนวน candidate ที่ขอจาก stage 1 มา rerank — ตัวแปรหลักของ trade-off ทั้ง workshop */
  topN?: number;
}

export interface RerankProvenance {
  noteId: string;
  rankBefore: number; // อันดับจาก stage 1 (1-indexed)
  rankAfter: number; // อันดับหลัง rerank (1-indexed)
  stage1Score: number;
  rerankScore: number;
}

interface LastTiming {
  stage1Ms: number;
  rerankMs: number;
}

/**
 * 2-stage retrieval: stage 1 (backend เดิม) คัด candidate กว้างๆ โดยเน้น recall
 * → stage 2 (cross-encoder) จัดอันดับ topN นั้นใหม่ทั้งหมดโดยเน้น precision
 * ต้องแยก stage1Ms/rerankMs เสมอ ไม่งั้นจะสรุปผิดว่าช้าเพราะ retrieve ทั้งที่ต้นทุน
 * ส่วนใหญ่มาจาก cross-encoder ที่เป็น O(N) ต่อ query (ต่างจาก bi-encoder ของ WS03
 * ที่ document embed ล่วงหน้าได้หมดแล้ว เหลือแค่ O(1) lookup ตอน query)
 */
export class RerankBackend implements SearchBackend {
  readonly name: string;

  private readonly innerBackend: SearchBackend;
  private readonly topN: number;
  private lastProvenance: RerankProvenance[] = [];
  private lastTiming: LastTiming | undefined;

  constructor(options: RerankBackendOptions) {
    this.name = options.name ?? "rerank";
    this.innerBackend = options.innerBackend;
    this.topN = options.topN ?? 20;
  }

  async index(notes: MemoryNote[]): Promise<void> {
    await this.innerBackend.index(notes);
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const stage1Start = performance.now();
    const candidates = await this.innerBackend.search({ ...query, limit: this.topN });
    const stage1Ms = performance.now() - stage1Start;

    if (candidates.length === 0) {
      this.lastProvenance = [];
      this.lastTiming = { stage1Ms, rerankMs: 0 };
      return [];
    }

    const docs = candidates.map((c) => extractRerankText(c.note));
    const { scores, rerankMs } = await rerank(query.text, docs);

    const reranked = candidates
      .map((c, i) => ({ result: c, rerankScore: scores[i]!, rankBefore: i + 1 }))
      .sort((a, b) => b.rerankScore - a.rerankScore);

    this.lastProvenance = reranked.map((r, i) => ({
      noteId: r.result.note.id,
      rankBefore: r.rankBefore,
      rankAfter: i + 1,
      stage1Score: r.result.score,
      rerankScore: r.rerankScore,
    }));
    this.lastTiming = { stage1Ms, rerankMs };

    const results: SearchResult[] = reranked.map((r) => ({
      note: r.result.note,
      score: r.rerankScore,
      matchedBy: r.result.matchedBy,
    }));

    return query.limit ? results.slice(0, query.limit) : results;
  }

  /** diagnostic เท่านั้น — อันดับก่อน/หลัง rerank ของทุกผลลัพธ์ */
  getLastProvenance(): RerankProvenance[] {
    return this.lastProvenance;
  }

  /** diagnostic เท่านั้น — แยก stage1Ms (retrieve) กับ rerankMs (cross-encoder) */
  getLastTiming(): LastTiming | undefined {
    return this.lastTiming;
  }

  async stats(): Promise<{ indexedCount: number; sizeBytes: number; buildTimeMs: number }> {
    return this.innerBackend.stats();
  }
}

/** ตัดความยาว excerpt ที่ส่งให้ cross-encoder — เอกสารยาวเกินไปจะถูก tokenizer truncate อยู่ดี ตัดไว้ก่อนเพื่อความเร็ว */
function extractRerankText(note: MemoryNote): string {
  const body = note.content
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .join(" ");
  return body.length > 800 ? `${body.slice(0, 800)}…` : body;
}
