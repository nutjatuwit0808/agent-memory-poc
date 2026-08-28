import type Database from "better-sqlite3";
import { statSync } from "node:fs";
import { join } from "node:path";
import type { MemoryNote, SearchQuery, SearchResult } from "../../core/types.js";
import type { SearchBackend } from "../backend.interface.js";
import { reindex, DB_PATH, VAULT_DIR } from "./reindex-core.js";
import { openDb } from "./sqlite-db.js";

/**
 * แต่ละคำใน query ถูกครอบด้วย double-quote (phrase token เดี่ยว) แล้ว escape `"`
 * ข้างในเป็น `""` — กัน FTS5 query syntax เช่น OR / NEAR / * / AND ไม่ให้ถูกตีความ
 * เป็น operator โดยไม่ตั้งใจ จากนั้นรวมคำด้วย OR เอง (เทียบเคียงกับที่ ripgrep backend
 * ใน WS01 ใช้ -e หลายตัว OR กัน — ทำให้ผลสองฝั่งเทียบกันได้ตรงๆ ไม่ใช่ backend หนึ่งกว้าง
 * กว่าอีกฝั่งเพราะ operator เริ่มต้นต่างกัน)
 */
function buildMatchExpression(text: string): string {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  return words.map((w) => `"${w.replace(/"/g, '""')}"`).join(" OR ");
}

interface RowResult {
  id: string;
  bm25_rank: number;
}

function buildSearchSql(hasLayer: boolean, hasDomain: boolean, tagCount: number): string {
  const conditions = ["notes_fts MATCH @matchExpr"];
  if (hasLayer) conditions.push("n.layer = @layer");
  if (hasDomain) conditions.push("n.domain = @domain");

  let tagJoin = "";
  if (tagCount > 0) {
    const placeholders = Array.from({ length: tagCount }, (_, i) => `@tag${i}`).join(", ");
    tagJoin = `
      AND n.id IN (
        SELECT note_id FROM note_tags
        WHERE tag IN (${placeholders})
        GROUP BY note_id
        HAVING COUNT(DISTINCT tag) = @tagCount
      )`;
  }

  return `
    SELECT n.id AS id, bm25(notes_fts) AS bm25_rank
    FROM notes_fts
    JOIN notes n ON n.rowid = notes_fts.rowid
    WHERE ${conditions.join(" AND ")}
    ${tagJoin}
    ORDER BY bm25_rank ASC
    LIMIT @limit
  `;
}

export class Fts5Backend implements SearchBackend {
  readonly name = "fts5";

  private db: Database.Database | undefined;
  private notesById = new Map<string, MemoryNote>();
  private lastBuildTimeMs = 0;

  /**
   * เรียก reindex() แบบ incremental (สม่ำเสมอกับการใช้งานจริง — production เรียก
   * index() ทุกครั้งที่ vault เปลี่ยน ไม่ใช่ full rebuild ทุกครั้ง) แล้วเก็บ notes
   * ไว้ใน Map เพื่อ hydrate SearchResult.note กลับเป็น MemoryNote เต็มรูป — schema
   * SQLite ไม่ได้เก็บ `links` เลย (ไม่มี column) การ hydrate จาก Map นี้จึงจำเป็น
   * ไม่ใช่ทางลัดของการค้นหา (การ match/rank ทั้งหมดเกิดใน SQL ล้วนๆ)
   */
  async index(notes: MemoryNote[]): Promise<void> {
    const stats = reindex(notes, false);
    this.lastBuildTimeMs = stats.buildTimeMs;
    this.notesById = new Map(notes.map((n) => [n.id, n]));

    this.db?.close();
    this.db = openDb(DB_PATH);
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    if (!this.db) throw new Error("[fts5.backend] ต้องเรียก index() ก่อน search()");

    const matchExpr = buildMatchExpression(query.text);
    if (matchExpr.length === 0) return [];

    const tags = query.tags ?? [];
    const sql = buildSearchSql(query.layer !== undefined, query.domain !== undefined, tags.length);
    const stmt = this.db.prepare(sql);

    const params: Record<string, string | number> = {
      matchExpr,
      limit: query.limit ?? -1, // SQLite: LIMIT -1 = ไม่จำกัด
    };
    if (query.layer !== undefined) params.layer = query.layer;
    if (query.domain !== undefined) params.domain = query.domain;
    tags.forEach((tag, i) => {
      params[`tag${i}`] = tag;
    });
    if (tags.length > 0) params.tagCount = tags.length;

    const rows = stmt.all(params) as RowResult[];

    const results: SearchResult[] = [];
    for (const row of rows) {
      const note = this.notesById.get(row.id);
      if (!note) continue;
      // bm25() ใน SQLite คืนค่าติดลบ (ยิ่งน้อย/ติดลบมากยิ่งเกี่ยวข้องมาก) แต่
      // SearchResult.score ต้อง "ยิ่งมากยิ่งดี" ตาม interface — กลับเครื่องหมายตรงนี้
      // ที่เดียว เพื่อไม่ให้ค่าติดลบไปปนกับ caller ที่คาดว่า "มากคือดี"
      results.push({ note, score: -row.bm25_rank, matchedBy: "fts" });
    }

    return results;
  }

  /**
   * ตรวจว่า index stale ไหม — เทียบ mtime ที่เก็บใน DB (ตอน reindex ล่าสุด) กับ
   * mtime จริงของไฟล์ในวอลต์ตอนนี้ **ไม่ได้เรียกจาก search() อัตโนมัติ** เพราะการ
   * stat ทุกไฟล์ทุกครั้งที่ search จะบวกต้นทุน O(n) กลับเข้าไปใน hot path ซึ่งขัดกับ
   * จุดขายของ index (`search()` ที่วัด p50/p95 ในเบนช์มาร์กหลักไม่มีต้นทุนนี้ปนอยู่)
   * ในระบบจริงเช็คนี้ควรรันเป็น background job หรือ file watcher แยกต่างหาก
   * ไม่ใช่ inline กับทุก query — ดู README หัวข้อ "production แก้ปัญหานี้ยังไง"
   */
  checkStale(): { staleCount: number; staleIds: string[] } {
    if (!this.db) throw new Error("[fts5.backend] ต้องเรียก index() ก่อน checkStale()");

    const rows = this.db.prepare("SELECT id, mtime FROM notes").all() as { id: string; mtime: number }[];
    const staleIds: string[] = [];

    for (const row of rows) {
      const currentMtime = statSync(join(VAULT_DIR, row.id)).mtimeMs;
      if (currentMtime !== row.mtime) staleIds.push(row.id);
    }

    return { staleCount: staleIds.length, staleIds };
  }

  async stats(): Promise<{ indexedCount: number; sizeBytes: number; buildTimeMs: number }> {
    if (!this.db) throw new Error("[fts5.backend] ต้องเรียก index() ก่อน stats()");

    const { count } = this.db.prepare("SELECT COUNT(*) AS count FROM notes").get() as { count: number };
    const pageCount = this.db.pragma("page_count", { simple: true }) as number;
    const pageSize = this.db.pragma("page_size", { simple: true }) as number;

    return {
      indexedCount: count,
      sizeBytes: pageCount * pageSize,
      buildTimeMs: this.lastBuildTimeMs,
    };
  }
}
