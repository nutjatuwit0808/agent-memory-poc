-- Schema สำหรับ Workshop 02 (SQLite FTS5)
-- ไม่ใช้ ORM ใดๆ — DDL ตรงๆ ให้เห็นว่าเกิดอะไรขึ้นจริง (CLAUDE.md §6)

-- notes: metadata + เนื้อหาเต็มของแต่ละ note
-- id เป็น TEXT PRIMARY KEY (relative path จาก vault root) แต่ SQLite ยังสร้าง
-- implicit rowid (integer) ให้อัตโนมัติเพราะ TEXT PRIMARY KEY ไม่ได้เป็น alias ของ
-- rowid เหมือน INTEGER PRIMARY KEY — notes_fts ด้านล่างอ้างอิง rowid ตัวนี้
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  layer TEXT NOT NULL,
  domain TEXT NOT NULL,       -- namespace ของ note (ดู plans/12-domain-facet.md) — "core" สำหรับ PayFlow เดิม
  created_at TEXT NOT NULL,   -- ISO 8601
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL, -- sha256(content) — ใช้เช็คว่า note เปลี่ยนไหมตอน incremental reindex
  mtime INTEGER NOT NULL      -- unix ms ของไฟล์ตอนอ่านล่าสุด — ใช้เช็ค stale index ตอน search
);

CREATE INDEX IF NOT EXISTS idx_notes_domain ON notes(domain);

-- note_tags: normalize tag ออกมาเป็นตารางแยก เพื่อให้ filter ด้วย SQL (WHERE tag = ?) ได้ตรงๆ
-- แทนที่จะเก็บเป็น JSON array ในคอลัมน์เดียวแล้วต้อง parse ทีหลัง
CREATE TABLE IF NOT EXISTS note_tags (
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (note_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag);

-- notes_fts: virtual table แบบ "external content" — ไม่เก็บ text ซ้ำสองที่
-- (content='notes' บอกว่าเนื้อหาจริงอยู่ที่ตาราง notes, content_rowid='rowid' บอกว่า
-- อ้างอิงกันด้วย rowid ของ notes) วิธีนี้ทำให้เห็นความต่างของ index size ชัดเจน
-- เพราะ notes_fts เก็บแค่ inverted index ไม่ได้ก็อปปี้ content
--
-- tokenizer: unicode61 (ตัวมาตรฐานของ FTS5) — ตัดคำด้วยขอบเขต Unicode word boundary
-- ซึ่ง "ตัดคำไทยไม่ได้จริง" เพราะภาษาไทยไม่มีช่องว่างคั่นคำ unicode61 จะมองข้อความไทย
-- ทั้งประโยคเป็น "คำเดียว" ยาวๆ (หรือแตกตามเครื่องหมายวรรคตอนที่มีเท่านั้น) ดูตัวอย่าง
-- จริงและผลกระทบที่ README ของ workshop นี้
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  content,
  tokenize = 'unicode61',
  content = 'notes',
  content_rowid = 'rowid'
);

-- Trigger sync: notes_fts ไม่รู้จักการเปลี่ยนแปลงของ notes เองอัตโนมัติ (นี่คือ external
-- content — ต้องเขียน trigger เองเพื่อ sync ทุกครั้ง) การเขียน trigger เหล่านี้เองทำให้
-- เห็นว่า "index ต้องถูก sync" เป็นงานที่มีอยู่จริง ไม่ใช่เวทมนตร์ที่เกิดขึ้นเอง
CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(rowid, content) VALUES (new.rowid, new.content);
END;

CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, content) VALUES ('delete', old.rowid, old.content);
END;

CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, content) VALUES ('delete', old.rowid, old.content);
  INSERT INTO notes_fts(rowid, content) VALUES (new.rowid, new.content);
END;
