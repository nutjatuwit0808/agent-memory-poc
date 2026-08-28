import { createHash } from "node:crypto";
import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import type { MemoryNote } from "../../core/types.js";
import { openDb } from "./sqlite-db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = join(__dirname, "..", "..", "..");
export const VAULT_DIR = join(PROJECT_ROOT, "vault");
export const DB_PATH = join(PROJECT_ROOT, "data", "index.sqlite");

function contentHash(content: string): string {
  return createHash("sha256").update(content, "utf-8").digest("hex");
}

export interface ReindexStats {
  buildTimeMs: number;
  inserted: number;
  updated: number;
  deleted: number;
  skipped: number;
  totalNotes: number;
  dbSizeBytes: number;
}

/**
 * Full หรือ incremental reindex ตาม `full` — ใช้ทั้งจาก `cli/reindex.ts` และจาก
 * `fts5.backend.ts` ตอน index() เพื่อไม่ให้ logic การเขียนลง SQLite ซ้ำสองที่
 * รับ notes ที่อ่านมาแล้วเข้ามาตรงๆ (ไม่อ่าน vault เอง)
 *
 * Incremental เทียบ content_hash ต่อ note — note ที่ไม่เปลี่ยนจะถูก skip ไม่แตะ SQL
 * เลย (ประหยัด write + ไม่ trigger การ rebuild ของ notes_fts สำหรับ note นั้น)
 */
export function reindex(notes: MemoryNote[], full: boolean): ReindexStats {
  const db = openDb(DB_PATH);

  const start = performance.now();

  if (full) {
    db.exec("DELETE FROM notes"); // cascade ลบ note_tags, trigger ลบ notes_fts ให้เอง
  }

  const existing = new Map(
    (db.prepare("SELECT id, content_hash FROM notes").all() as { id: string; content_hash: string }[]).map((row) => [
      row.id,
      row.content_hash,
    ])
  );

  const insertNote = db.prepare(
    "INSERT INTO notes (id, layer, domain, created_at, content, content_hash, mtime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const updateNote = db.prepare(
    "UPDATE notes SET layer = ?, domain = ?, created_at = ?, content = ?, content_hash = ?, mtime = ? WHERE id = ?"
  );
  const deleteNote = db.prepare("DELETE FROM notes WHERE id = ?");
  const deleteTags = db.prepare("DELETE FROM note_tags WHERE note_id = ?");
  const insertTag = db.prepare("INSERT INTO note_tags (note_id, tag) VALUES (?, ?)");

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let deleted = 0;

  const currentIds = new Set(notes.map((n) => n.id));

  const applyTags = (note: MemoryNote) => {
    deleteTags.run(note.id);
    for (const tag of note.tags) insertTag.run(note.id, tag);
  };

  const tx = db.transaction(() => {
    for (const note of notes) {
      const hash = contentHash(note.content);
      const mtime = statSync(join(VAULT_DIR, note.id)).mtimeMs;
      const existingHash = existing.get(note.id);

      if (existingHash === undefined) {
        insertNote.run(note.id, note.layer, note.domain, note.createdAt, note.content, hash, mtime);
        applyTags(note);
        inserted++;
      } else if (existingHash !== hash) {
        updateNote.run(note.layer, note.domain, note.createdAt, note.content, hash, mtime, note.id);
        applyTags(note);
        updated++;
      } else {
        skipped++;
      }
    }

    for (const id of existing.keys()) {
      if (!currentIds.has(id)) {
        deleteNote.run(id);
        deleted++;
      }
    }
  });

  tx();
  const buildTimeMs = performance.now() - start;

  // WAL mode ไม่ flush หน้าเข้าไฟล์หลักทันที — ต้อง checkpoint ก่อนวัดขนาดไฟล์
  // ไม่งั้น sizeBytes ที่รายงานจะเป็นขนาดตอนเปิด DB ครั้งก่อน ไม่ใช่ขนาดจริงล่าสุด
  db.pragma("wal_checkpoint(TRUNCATE)");
  const dbSizeBytes = statSync(DB_PATH).size;
  db.close();

  return { buildTimeMs, inserted, updated, deleted, skipped, totalNotes: notes.length, dbSizeBytes };
}
