import type { MemoryNote, SearchQuery, SearchResult } from "../../core/types.js";
import type { SearchBackend } from "../backend.interface.js";
import { LinkGraph, type LinkDirection } from "./link-graph.js";

export interface GraphBackendOptions {
  name?: string;
  /** backend ที่ให้ผลลัพธ์เริ่มต้น (seed) มาก่อนขยายตาม link — D-10: default router-route */
  seedBackend: SearchBackend;
  /** D-9: จำนวน hop สูงสุดที่ขยายจาก seed */
  hops?: 1 | 2;
  /** D-9: ตัวคูณคะแนนต่อ 1 hop — คะแนนยิ่งไกลจาก seed ยิ่งลด */
  decay?: number;
  /** ทิศทางที่เดินตาม link — default undirected (ดูเหตุผลใน README) */
  direction?: LinkDirection;
  /** จำนวนผลลัพธ์จาก seedBackend ที่เอามาเป็นจุดเริ่มขยาย (ไม่ใช่ limit ของผลลัพธ์สุดท้าย) */
  seedTopK?: number;
}

export interface ProvenanceEntry {
  noteId: string;
  /** seed note id ที่พาไปเจอ note นี้ (ตัวมันเองถ้าเป็น hop 0) */
  seedId: string;
  hop: number;
  contribution: number;
}

/**
 * เอา top-k จาก seedBackend เป็น "เมล็ด" แล้วขยายตาม link 1–2 hop (D-9)
 * คะแนน = Σ ต่อ seed ที่ไปถึง note นั้นได้ (note ที่ถูกชี้จากหลาย seed สะสมคะแนนกัน)
 * แต่ละ seed เดียวนับแค่เส้นทางที่ดีที่สุด (hop สั้นสุด) ไม่นับซ้ำถ้าไปถึงได้หลาย hop
 * จากคนเดียวกัน — สูตรนี้จึงต่างจาก D-9 ที่เสนอไว้แรกเริ่ม (max ล้วน) เพราะสเปกของ W6-3
 * ("note ที่ถูกชี้จากหลาย seed ต้องได้คะแนนสะสม") ต้องการการรวมข้าม seed ด้วย ไม่ใช่แค่ max เดี่ยวๆ
 */
export class GraphBackend implements SearchBackend {
  readonly name: string;

  private readonly seedBackend: SearchBackend;
  private readonly hops: 1 | 2;
  private readonly decay: number;
  private readonly direction: LinkDirection;
  private readonly seedTopK: number;

  private graph: LinkGraph | undefined;
  private notesById = new Map<string, MemoryNote>();
  private lastProvenance: ProvenanceEntry[] = [];

  constructor(options: GraphBackendOptions) {
    this.name = options.name ?? "graph";
    this.seedBackend = options.seedBackend;
    this.hops = options.hops ?? 1;
    this.decay = options.decay ?? 0.5;
    this.direction = options.direction ?? "undirected";
    this.seedTopK = options.seedTopK ?? 5;
  }

  async index(notes: MemoryNote[]): Promise<void> {
    await this.seedBackend.index(notes);
    this.graph = new LinkGraph(notes);
    this.notesById = new Map(notes.map((n) => [n.id, n]));
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    if (!this.graph) throw new Error("[graph.backend] ต้องเรียก index() ก่อน search()");
    const graph = this.graph;

    const seedResults = await this.seedBackend.search({ ...query, limit: this.seedTopK });

    // noteId -> seedId -> contribution ที่ดีที่สุดจาก seed นั้น (ป้องกันนับซ้ำถ้า seed
    // เดียวกันไปถึง note เดียวกันได้หลาย hop — เอา hop สั้นสุด/คะแนนสูงสุดของคู่นั้นพอ)
    const bestBySeed = new Map<string, Map<string, { hop: number; contribution: number }>>();
    const matchedByNoteId = new Map<string, SearchResult["matchedBy"]>();

    const record = (noteId: string, seedId: string, hop: number, contribution: number, matchedBy: SearchResult["matchedBy"]) => {
      const bySeed = bestBySeed.get(noteId) ?? new Map();
      const prev = bySeed.get(seedId);
      if (prev === undefined || contribution > prev.contribution) {
        bySeed.set(seedId, { hop, contribution });
      }
      bestBySeed.set(noteId, bySeed);
      if (!matchedByNoteId.has(noteId)) matchedByNoteId.set(noteId, matchedBy);
    };

    for (const seed of seedResults) {
      record(seed.note.id, seed.note.id, 0, seed.score, seed.matchedBy);
    }

    if (this.hops >= 1) {
      for (const seed of seedResults) {
        for (const hop1Id of graph.neighbors(seed.note.id, this.direction)) {
          record(hop1Id, seed.note.id, 1, seed.score * this.decay, seed.matchedBy);
        }
      }
    }

    if (this.hops >= 2) {
      for (const seed of seedResults) {
        for (const hop1Id of graph.neighbors(seed.note.id, this.direction)) {
          for (const hop2Id of graph.neighbors(hop1Id, this.direction)) {
            record(hop2Id, seed.note.id, 2, seed.score * this.decay * this.decay, seed.matchedBy);
          }
        }
      }
    }

    // คะแนนสุดท้าย = รวม contribution ที่ดีที่สุดของแต่ละ seed เข้าด้วยกัน (สะสมข้าม seed)
    const finalScore = new Map<string, number>();
    const provenance: ProvenanceEntry[] = [];
    for (const [noteId, bySeed] of bestBySeed) {
      let total = 0;
      for (const [seedId, { hop, contribution }] of bySeed) {
        total += contribution;
        provenance.push({ noteId, seedId, hop, contribution });
      }
      finalScore.set(noteId, total);
    }

    provenance.sort((a, b) => b.contribution - a.contribution);
    this.lastProvenance = provenance;

    const results: SearchResult[] = [];
    for (const [noteId, score] of finalScore) {
      const note = this.notesById.get(noteId);
      if (!note) continue;
      results.push({ note, score, matchedBy: matchedByNoteId.get(noteId)! });
    }
    results.sort((a, b) => b.score - a.score);

    return query.limit ? results.slice(0, query.limit) : results;
  }

  /** diagnostic เท่านั้น — บอกว่าแต่ละผลลัพธ์มาจาก seed ไหน hop เท่าไหร่ เรียงตาม contribution */
  getLastProvenance(): ProvenanceEntry[] {
    return this.lastProvenance;
  }

  async stats(): Promise<{ indexedCount: number; sizeBytes: number; buildTimeMs: number }> {
    const seedStats = await this.seedBackend.stats();
    const graphBytes = this.graph
      ? this.graph.stats.edgeCount * 2 * 40 // ประมาณ: 2 ทิศ (forward+backward) × ~40 byte ต่อ string id เฉลี่ย
      : 0;
    return {
      indexedCount: seedStats.indexedCount,
      sizeBytes: seedStats.sizeBytes + graphBytes,
      buildTimeMs: seedStats.buildTimeMs,
    };
  }
}
