import { performance } from "node:perf_hooks";
import type { MemoryNote, SearchQuery, SearchResult } from "../../core/types.js";
import type { SearchBackend } from "../backend.interface.js";
import { chunkNote, wholeNoteChunk, type Chunk } from "./chunking.js";
import { EmbeddingCache, embedWithCache } from "./embedding-cache.js";
import { MODEL_NAME, EMBEDDING_DIM } from "./embedder.js";

interface IndexedChunk extends Chunk {
  vector: Float32Array;
}

/**
 * cosine similarity เขียนเอง — เวกเตอร์ทั้งสองฝั่งถูก L2 normalize มาแล้วจาก embedder.ts
 * (norm = 1 เสมอ) ดังนั้น cosine(a, b) = (a·b) / (|a||b|) = (a·b) / (1×1) = a·b ตรงๆ
 * ไม่ต้องหารด้วย norm ซ้ำอีก — ถ้าลืม normalize ตอน embed สูตรนี้จะผิดทันที
 */
function cosineSim(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i]! * b[i]!;
  return sum;
}

export interface VectorBackendOptions {
  name?: string;
  chunking?: boolean; // false = whole-note baseline (W3-2)
  cacheDbPath?: string;
  scoreAggregation?: "max" | "mean"; // ตัดสินแล้ว: max (ดูเหตุผลใน README W3-2)
}

interface SearchTiming {
  embedQueryMs: number;
  searchMs: number;
}

export class VectorBackend implements SearchBackend {
  readonly name: string;

  private readonly useChunking: boolean;
  private readonly scoreAggregation: "max" | "mean";
  private readonly cache: EmbeddingCache;

  private notesById = new Map<string, MemoryNote>();
  private chunks: IndexedChunk[] = [];
  private lastBuildTimeMs = 0;
  private lastSearchTiming: SearchTiming | undefined;

  constructor(options: VectorBackendOptions = {}) {
    this.name = options.name ?? "vector";
    this.useChunking = options.chunking ?? true;
    this.scoreAggregation = options.scoreAggregation ?? "max";
    this.cache = new EmbeddingCache(options.cacheDbPath);
  }

  async index(notes: MemoryNote[]): Promise<void> {
    this.notesById = new Map(notes.map((n) => [n.id, n]));
    const chunker = this.useChunking ? chunkNote : wholeNoteChunk;
    const allChunks: Chunk[] = notes.flatMap((n) => chunker(n));

    const start = performance.now();
    const texts = allChunks.map((c) => c.embedText);
    const { vectors } = await embedWithCache(this.cache, MODEL_NAME, texts);
    this.lastBuildTimeMs = performance.now() - start;

    this.chunks = allChunks.map((c, i) => ({ ...c, vector: vectors[i]! }));
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const embedStart = performance.now();
    const { vectors } = await embedWithCache(this.cache, MODEL_NAME, [query.text]);
    const queryVec = vectors[0]!;
    const embedQueryMs = performance.now() - embedStart;

    const searchStart = performance.now();

    // pre-filter: ข้าม chunk ที่ note เจ้าของไม่ผ่าน layer/tags/domain ตั้งแต่ก่อนคำนวณ cosine เลย
    // ทำได้เพราะ metadata (layer, tags, domain) อยู่ในหน่วยความจำผ่าน notesById อยู่แล้ว
    const requiredTags = query.tags ?? [];
    const candidates = this.chunks.filter((chunk) => {
      const note = this.notesById.get(chunk.noteId);
      if (!note) return false;
      if (query.layer && note.layer !== query.layer) return false;
      if (query.domain && note.domain !== query.domain) return false;
      if (requiredTags.length > 0 && !requiredTags.every((t) => note.tags.includes(t))) return false;
      return true;
    });

    const bestScoreByNote = new Map<string, number>();
    const sumScoreByNote = new Map<string, number>();
    const countByNote = new Map<string, number>();

    for (const chunk of candidates) {
      const score = cosineSim(queryVec, chunk.vector);
      const prevBest = bestScoreByNote.get(chunk.noteId);
      if (prevBest === undefined || score > prevBest) bestScoreByNote.set(chunk.noteId, score);
      sumScoreByNote.set(chunk.noteId, (sumScoreByNote.get(chunk.noteId) ?? 0) + score);
      countByNote.set(chunk.noteId, (countByNote.get(chunk.noteId) ?? 0) + 1);
    }

    const results: SearchResult[] = [];
    for (const [noteId, best] of bestScoreByNote) {
      const note = this.notesById.get(noteId);
      if (!note) continue;
      const score = this.scoreAggregation === "max" ? best : sumScoreByNote.get(noteId)! / countByNote.get(noteId)!;
      results.push({ note, score, matchedBy: "vector" });
    }

    results.sort((a, b) => b.score - a.score);
    const searchMs = performance.now() - searchStart;
    this.lastSearchTiming = { embedQueryMs, searchMs };

    return query.limit ? results.slice(0, query.limit) : results;
  }

  /** สำหรับ diagnostic เท่านั้น (ไม่อยู่ใน SearchBackend interface) — แยก embedQueryMs vs searchMs ตาม W3-4 DoD */
  getLastSearchTiming(): SearchTiming | undefined {
    return this.lastSearchTiming;
  }

  getChunkStats(): { totalChunks: number; chunksPerNote: number[] } {
    const perNote = new Map<string, number>();
    for (const c of this.chunks) perNote.set(c.noteId, (perNote.get(c.noteId) ?? 0) + 1);
    return { totalChunks: this.chunks.length, chunksPerNote: Array.from(perNote.values()) };
  }

  async stats(): Promise<{ indexedCount: number; sizeBytes: number; buildTimeMs: number }> {
    return {
      indexedCount: this.notesById.size,
      sizeBytes: this.chunks.length * EMBEDDING_DIM * 4, // Float32 = 4 bytes ต่อมิติ
      buildTimeMs: this.lastBuildTimeMs,
    };
  }
}
