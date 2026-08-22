# Workshop 02 — SQLite FTS5

## คำถามตั้งต้น

- index เร็วกว่าเพราะอะไร (กลไกจริง ไม่ใช่ "เพราะมัน index ไว้")
- ต้องจ่ายอะไรแลก — เวลา build, พื้นที่, ความซับซ้อน
- "index stale" คือปัญหาอะไร เกิดตอนไหน แก้ยังไง

## ทฤษฎีสั้น

Inverted index = พลิกจาก "ไฟล์ไหนมีคำอะไร" เป็น "คำนี้อยู่ไฟล์ไหนบ้าง" → query เปลี่ยนจากสแกน corpus ทั้งหมด (WS01) เป็น lookup + intersect posting list เท่านั้น BM25 เพิ่มสองอย่างที่ ripgrep ไม่มี: **IDF** (คำที่หายากมีน้ำหนักมากกว่า) และ **length normalization** (แก้ length bias ที่เจอใน WS01 — ใช้ term *density* ไม่ใช่ raw count) ราคาที่จ่าย: index ต้องถูก build ก่อน และมันไม่รู้ตัวเมื่อ vault เปลี่ยน (stale)

---

## W2-1 — Spike: ยืนยัน FTS5

**เครื่องที่วัด:** Node.js v26.2.0, Windows 11 Home (10.0.26200), Intel(R) Core(TM) Ultra 7 265

| Driver | SQLite version | `ENABLE_FTS5` |
|---|---|---|
| `better-sqlite3` (เลือกใช้จริง, D-3) | 3.53.4 | ✅ ยืนยันจาก `pragma_compile_options()` |
| `node:sqlite` (built-in ของ Node 26, ไม่ได้เลือก) | 3.53.1 | ✅ ก็เปิดอยู่เหมือนกันบนเครื่องนี้ |

ผล `pragma_compile_options()` ที่เกี่ยวกับ FTS จาก `better-sqlite3`: `ENABLE_FTS3`, `ENABLE_FTS3_PARENTHESIS`, `ENABLE_FTS4`, `ENABLE_FTS5` — ครบทุกเวอร์ชันของ FTS ไม่ใช่แค่ FTS5

**ทำไมยังเลือก `better-sqlite3` ทั้งที่ `node:sqlite` ก็มี FTS5:** D-3 บอกเหตุผลไว้แล้วว่า `node:sqlite` ผูกกับ Node version (ยังไม่เสถียรเป็น stable API ในหลายเวอร์ชัน Node ก่อนหน้า) — เห็นจริงในการทดสอบนี้ว่าปีนี้มันมี FTS5 พอดี แต่ risk คือถ้าเปลี่ยนเครื่อง/เปลี่ยน Node version อาจไม่มี ในขณะที่ `better-sqlite3` เป็น dependency ที่ pin เวอร์ชันได้แน่นอนกว่า และ sync API อ่านง่ายกว่าเวลาสอน

---

## W2-2 — Schema

DDL เต็มอยู่ที่ [`src/search/backends/schema.sql`](../../src/search/backends/schema.sql) — 3 ตาราง: `notes` (metadata + content เต็ม), `note_tags` (normalize เพื่อ filter SQL ได้), `notes_fts` (virtual table แบบ **external content** — ไม่เก็บ text ซ้ำ อ้างอิงกลับไปที่ `notes` ผ่าน `rowid`) พร้อม trigger `notes_ai`/`notes_ad`/`notes_au` ที่ sync `notes_fts` เองทุกครั้งที่ `notes` insert/update/delete

### Tokenizer `unicode61` กับข้อความไทย — ตัวอย่างจริงจาก vault นี้

`unicode61` ตัดคำด้วย Unicode word-boundary ซึ่ง**ไม่รู้จักขอบเขตคำภาษาไทยเลย** (ไทยไม่มีช่องว่างคั่นคำ) ผลคือข้อความไทยทั้งประโยคที่ไม่มีเครื่องหมายวรรคตอนคั่นจะกลายเป็น "1 token" ยาวๆ ดูจาก `fts5vocab` จริงของ vault นี้ — 3 token ที่ยาวที่สุดคือ:

```
งตรรกะของระบบเราเองและจากฝ   (จากคำว่า "...ตรรกะของระบบเราเองและจากฝั่ง...")
เพราะการประสานงานระหว          (จากคำว่า "...เพราะการประสานงานระหว่าง...")
อลดความประหลาดใจแบบน           (จากคำว่า "...เพื่อลดความประหลาดใจแบบนี้...")
```

ผลกระทบที่วัดได้จริง: ค้นหา `MATCH 'คืนเงิน'` (คำที่มีอยู่จริงในเนื้อหาหลายสิบครั้งตาม ripgrep ใน WS01) ได้แค่ **1 ผลลัพธ์** ในขณะที่ `MATCH 'refund'` (คำอังกฤษ มีช่องว่างคั่นจริง) ได้ **31 ผลลัพธ์** ทั้งที่สองคำนี้ใช้แทนกันในเนื้อหาบ่อยมาก — เพราะ "คืนเงิน" ส่วนใหญ่ฝังอยู่กลาง token ยาวๆ ที่ unicode61 ตัดไม่ออก ไม่ได้ยืนเป็น token เดี่ยวๆ

**นี่คือจุดที่ vector search (WS03) จะได้เปรียบชัดเจน** — ไม่ต้องพึ่ง token boundary เลยเพราะทำงานบน embedding ของทั้งประโยค

---

## W2-3 — `reindex.ts`

Logic อยู่ที่ [`src/search/backends/reindex-core.ts`](../../src/search/backends/reindex-core.ts) ใช้ร่วมกันทั้ง CLI (`npm run reindex`) และ `fts5.backend.ts` (`index()` เรียก incremental เสมอ — สม่ำเสมอกับการใช้งานจริงที่ไม่ full rebuild ทุกครั้ง)

**Incremental เทียบ `content_hash` (sha256) ต่อ note** — note ที่ไม่เปลี่ยนถูก skip ไม่แตะ SQL เลย วัดจริง:

| สถานการณ์ | inserted | updated | skipped | buildTimeMs |
|---|---|---|---|---|
| Full rebuild จากศูนย์ (`--full`, 55 notes) | 55 | 0 | 0 | 16.60 – 28.83 (3 รอบ) |
| Incremental รอบถัดมา (ไม่มีอะไรเปลี่ยน) | 0 | 0 | 55 | 3.10 – 3.41 |
| Incremental หลังแก้ 1 ไฟล์ (`tax-calculation.md`) | 0 | 1 | 54 | 4.81 |

**`--full` กับ incremental ให้ผลค้นหาเหมือนกันเป๊ะ** — ทดสอบโดยรัน `--full` แล้ว incremental ติดกัน ผลลัพธ์ query ชุดเดียวกันเหมือนกันทุกตัว (คาดว่าเหมือนเพราะ end state ของตาราง `notes`/`notes_fts` เหมือนกันไม่ว่าจะมาจากทางไหน)

**ลบ `data/index.sqlite` แล้ว rebuild ได้จริง** — ทดสอบ `rm data/index.sqlite* && npm run reindex -- --full` สำเร็จ ไม่มีข้อมูลหาย (vault คือ source of truth ตาม CLAUDE.md §2.2)

---

## W2-4 — `fts5.backend.ts`

Implement ครบ 3 method: `index()` เรียก `reindex()` แบบ incremental, `search()` ใช้ `MATCH` + `bm25()` + filter ใน `WHERE`, `stats()` นับแถวจริง + `page_count * page_size`

**bm25() คืนค่าติดลบ** (ยิ่งติดลบมาก = ยิ่งเกี่ยวข้อง ตาม SQLite convention) แต่ `SearchResult.score` ต้อง "ยิ่งมากยิ่งดี" ตาม interface — กลับเครื่องหมายที่จุดเดียวตอนสร้าง `SearchResult` (`score: -row.bm25_rank`)

**Escape:** แต่ละคำใน query ถูกครอบ `"..."` (phrase token เดี่ยว) + escape `"` ข้างในเป็น `""` ป้องกัน FTS5 syntax เช่น `OR`/`NEAR`/`*`/`AND` ไม่ให้ถูกตีความเป็น operator โดยไม่ตั้งใจ ทดสอบ query แปลกๆ ทั้งหมดไม่พัง:

| query | ผล |
|---|---|
| `refund "quoted phrase"` | 5 ผลลัพธ์ ไม่ error |
| `refund OR NEAR` | 5 ผลลัพธ์ ไม่ error |
| `refund*` | 5 ผลลัพธ์ (`*` ถูก escape ไม่ทำงานเป็น prefix operator) |
| `say "hi" NEAR* stuff OR more` | 0 ผลลัพธ์ ไม่ error |
| `a"b` (quote ค้าง) | 0 ผลลัพธ์ ไม่ error |
| `""` (query ว่าง) | 0 ผลลัพธ์ ไม่ error |

**Filter เป็น pre-filter จริง** (ต่างจาก WS01 ที่เป็น post-filter) — `EXPLAIN QUERY PLAN` ของ query ที่มี `layer` filter:

```
SCAN notes_fts VIRTUAL TABLE INDEX 0:M1
SEARCH n USING INTEGER PRIMARY KEY (rowid=?)
USE TEMP B-TREE FOR ORDER BY
```

เงื่อนไข `n.layer = @layer` ถูกประเมินตอน fetch แถวผ่าน `rowid` โดยตรง (ใน `SEARCH n USING INTEGER PRIMARY KEY`) — ไม่มีขั้นตอนแยกที่ต้องดึงผลลัพธ์ทั้งหมดออกมาก่อนแล้วค่อยกรองใน JavaScript เหมือน WS01 ทุก byte ที่ไม่ผ่าน filter ไม่เคยถูกส่งออกจาก SQLite engine เลยด้วยซ้ำ

SQL ทั้งหมดใช้ bound parameter (`@matchExpr`, `@layer`, `@tag0`...) ไม่มีการต่อ string ค่าเข้าไปใน query โดยตรง

---

## W2-5 — Stale index demo

**ทำไม `checkStale()` ไม่ถูกเรียกอัตโนมัติใน `search()`:** การ `stat()` ทุกไฟล์ทุกครั้งที่ query จะบวกต้นทุน O(n) กลับเข้าไปใน hot path ซึ่งขัดกับจุดขายทั้งหมดของ index (ตัวเลข p50 0.07ms ที่วัดได้ด้านล่างจะไม่ใช่ตัวเลขจริงของ FTS5 อีกต่อไปถ้าปนต้นทุนนี้เข้าไป) จึงแยกเป็น method `checkStale()` ต่างหากที่เรียกได้ตามใจ (background job / ก่อน critical query) — วิธีนี้เห็นชัดว่า "ความปลอดภัยจาก stale data" กับ "ความเร็วสูงสุด" เป็นคนละแกนที่ต้อง trade-off กันเอง ไม่มีคำตอบเดียวที่ถูกเสมอ

### ขั้นตอนสาธิต (รันจริง แปะ output จริง)

```
=== ขั้นที่ 1: index ตอน vault ยังไม่ถูกแก้ ===
search("kangaroo-marker-w2-5-demo") ก่อนแก้ไฟล์: 0 ผลลัพธ์ (คาดว่า 0)

=== ขั้นที่ 2: แก้ไฟล์ในวอลต์ (ไม่ reindex) ===
แก้ไฟล์แล้ว: vault/convention/branch-naming.md
search("kangaroo-marker-w2-5-demo") หลังแก้ไฟล์ แต่ยังไม่ reindex: 0 ผลลัพธ์ (คาดว่ายัง 0 — index เก่า)

checkStale() -> staleCount=1
⚠ index stale: 1 notes changed
  ไฟล์ที่เปลี่ยน: convention/branch-naming.md

=== ขั้นที่ 3: reindex แล้วค้นหาใหม่ ===
search("kangaroo-marker-w2-5-demo") หลัง reindex: 1 ผลลัพธ์ (คาดว่า 1)
  พบใน: convention/branch-naming.md

checkStale() หลัง reindex -> staleCount=0 (คาดว่า 0)
```

**ripgrep ไม่มีปัญหานี้เลย** เพราะอ่านของจริงทุกครั้ง (WS01) — นี่คือราคาที่แท้จริงของการมี index ไม่ใช่แค่ disk space ที่กินเพิ่ม แต่คือ **ความรับผิดชอบที่เพิ่มขึ้น** ในการทำให้ข้อมูลสองที่ (vault กับ index) ตรงกันตลอดเวลา

### production แก้ปัญหานี้ยังไงบ้าง

| แนวทาง | กลไก | Trade-off |
|---|---|---|
| **File watcher** | `fs.watch`/`chokidar` trigger reindex อัตโนมัติเมื่อไฟล์เปลี่ยน | เกือบ real-time แต่เพิ่ม process ที่ต้องรันตลอดเวลา + edge case ของ event ที่ debounce ไม่ดี |
| **Write-through** | ทุก write ไป vault ต้องผ่าน API ที่ update index พร้อมกันในธุรกรรมเดียว | ไม่มี stale window เลย แต่บังคับให้ทุกการเขียนต้องผ่านช่องทางเดียว (ใช้ไม่ได้ถ้า vault แก้ตรงๆ ผ่าน editor ได้ตามที่ CLAUDE.md §2.2 กำหนดไว้) |
| **TTL / periodic reindex** | reindex ทุก N นาทีไม่สนใจว่าเปลี่ยนจริงไหม | ง่ายสุด แต่มี stale window แน่นอนเสมอ (สูงสุด N นาที) |
| **checkStale() ก่อน query สำคัญ** (ที่ workshop นี้เลือกสาธิต) | เช็คแบบ on-demand ไม่ auto | ไม่มีต้นทุนแฝงในทุก query แต่ผู้เรียกต้องตั้งใจเรียกเอง ถ้าลืมก็ไม่รู้ว่า stale |

workshop นี้เลือกสาธิตแบบสุดท้ายเพราะตรงกับเป้าหมาย "เห็นกลไก" มากที่สุด — เห็นชัดว่า staleness คือปัญหาที่ต้องแก้ด้วยมือ ไม่ใช่ระบบมายากลที่ sync ให้อัตโนมัติ

---

## W2-6 — วัดผล + สรุป

**เครื่องที่วัด:** Node.js v26.2.0, Windows 11 Home (10.0.26200), Intel(R) Core(TM) Ultra 7 265 — 2026-08-22

### ตารางเทียบ ripgrep vs fts5 (จาก `npm run bench`)

| backend | p50 (ms) | p95 (ms) | recall@5 | precision@5 | MRR | indexed | size (bytes) | build (ms) |
|---|---|---|---|---|---|---|---|---|
| ripgrep | 29.87 | 33.57 | 0.74 | 0.27 | 0.71 | 55 | 0 | 0.00 |
| fts5 | 0.07 | 0.21 | 0.72 | 0.25 | 0.75 | 55 | 671,744 | 2.94 |

**เร็วขึ้น ~427 เท่า** (29.87ms → 0.07ms p50) โดย **recall/precision รวมแทบไม่ต่างกันเลย** (0.74→0.72, 0.27→0.25) — ความเร็วที่ได้ไม่ได้แลกกับคุณภาพการค้นหาโดยรวม

### Break-even point — ตัวเลขหัวใจของ workshop นี้

ต้นทุนที่ต้องจ่ายก่อน: **build index ~16.6–28.8ms** (full rebuild จากศูนย์)
กำไรที่ได้ต่อ query: **~29.8ms** (ผลต่าง p50 ระหว่างสอง backend)

```
break-even = buildTimeMs ÷ (ripgrep_p50 − fts5_p50)
           ≈ 20ms ÷ 29.8ms
           ≈ 0.67 query
```

**Index จ่ายคืนตัวเองก่อนจะยิง query แรกจบด้วยซ้ำ** เพราะต้นทุนสร้าง index (~20ms) ต่ำกว่ากำไรที่ได้จากการยิงแค่ query เดียว (~30ms) — บน corpus ขนาดนี้ (55 notes) แทบไม่มีเหตุผลที่จะไม่สร้าง index เลย ยกเว้นกรณีที่ query แบบ one-off จริงๆ (ยิงครั้งเดียวไม่ใช้ซ้ำ) ที่ ripgrep ยังคุ้มกว่าเพราะไม่ต้องมีขั้นตอน build เลย

**Index กินพื้นที่:** 671,744 bytes เทียบกับ vault ดิบ 161,968 bytes = **~4.1 เท่า** ของขนาดเนื้อหาต้นฉบับ (แม้จะเป็น external content ที่ไม่เก็บ text ซ้ำ — พื้นที่ส่วนใหญ่มาจาก inverted index เอง + `note_tags` + SQLite page overhead)

### BM25 แก้ length bias จาก WS01 ได้จริงไหม — ใช้เคสเดียวกับ W1-3

Query `"order"` เทียบอันดับ:

| Note | Rank (ripgrep, WS01) | Rank (fts5/BM25) | "order" count | words | density |
|---|---|---|---|---|---|
| `structure/module-order.md` | 3 | **3** | 11 | 89 | 0.124 |
| `business-logic/long-form-order-state-machine.md` | **1** ⚠ | 4 | 41 | 632 | 0.065 |
| `structure/module-inventory.md` | 4 | **1** | 11 | 67 | **0.164** |

**BM25 แก้ปัญหาเดิมได้บางส่วน ไม่ใช่สมบูรณ์แบบ:** note ยาว 632 คำที่เคยชนะอันดับ 1 อย่างไม่ควรใน WS01 (เพราะ raw match count สูงจากความยาวล้วนๆ) ตอนนี้ตกไปอันดับ 4 — ตรงตามที่คาดเพราะ BM25 มองที่ **density** (0.065 ต่ำสุดในกลุ่ม) ไม่ใช่ raw count (41 ครั้ง สูงสุดในกลุ่ม) แต่ BM25 ก็ไม่ได้เข้าใจว่า `module-order.md` คือเอกสาร "canonical" ของ order — มันแค่วัดสถิติคำ ทำให้ `module-inventory.md` (density สูงสุด 0.164 เพราะพูดถึง order สั้นๆ กระชับ) แซงขึ้นอันดับ 1 แทน **บทเรียน:** BM25 แก้ length bias แบบสถิติได้จริง แต่ไม่ใช่ตัวชี้วัด "ความเกี่ยวข้องเชิงหัวข้อ" ที่สมบูรณ์ — ยังต้องพึ่งความเข้าใจความหมายจริงซึ่งเป็นหน้าที่ของ WS03

### Query kind ไหนที่ยังแพ้อยู่

| kind | ripgrep recall@5 | fts5 recall@5 |
|---|---|---|
| exact | 1.00 | 1.00 |
| keyword | 0.90 | 1.00 |
| filtered | 1.00 | 0.80 |
| **semantic** | **0.07** | **0.07** |

`semantic` ยังพังเท่าเดิมทุกประการ (0.07 ทั้งคู่) — เพราะปัญหาไม่ได้อยู่ที่ "มี index หรือเปล่า" แต่อยู่ที่ **ไม่มี backend ไหนเข้าใจความหมายเลย** ทั้ง ripgrep และ FTS5 คือ literal token matching ทั้งคู่ ต่างกันแค่ว่าทำเร็วแค่ไหน ไม่ใช่ "ฉลาด" แค่ไหน — สังเกตด้วยว่า `filtered` แย่ลงเล็กน้อย (1.00→0.80) เพราะ FTS5 tokenizer ตัดคำไทยไม่ได้ (ดู W2-2) ทำให้บาง query ที่ ripgrep จับคำไทยแบบ substring ได้ กลับหาไม่เจอใน FTS5 ที่ต้องพึ่ง token boundary

---

## สรุป

FTS5 **เร็วกว่า ripgrep ~427 เท่า** และ**คุ้มค่าตั้งแต่ query แรก** (break-even < 1 query) โดยแทบไม่เสีย recall/precision รวมเลย และแก้ length bias จาก WS01 ได้จริงบางส่วนด้วย BM25 length normalization ราคาที่จ่ายคือ **ต้องดูแล index ให้ไม่ stale เอง** (ไม่มี mechanism อัตโนมัติในตัว) และ **tokenizer มาตรฐานตัดคำไทยไม่ได้** ทำให้ query ภาษาไทยบางแบบแย่ลงกว่า ripgrep ด้วยซ้ำ

ทั้งสอง backend ยังพังเหมือนกันทุกประการกับ query แบบ `semantic` (recall 0.07 ทั้งคู่)

### คำถามที่ WS03 (Vector search) ต้องตอบ

1. semantic search แก้ recall 0.07 ของ query kind `semantic` ได้จริงแค่ไหน?
2. ปัญหา tokenizer ตัดคำไทยไม่ได้ที่เจอใน W2-2 หายไปเมื่อใช้ embedding ไหม (เพราะไม่ต้องพึ่ง token boundary เลย)?
3. ต้นทุนที่แลกมาคืออะไร — latency ต่อ query, ต้นทุน embed ตอน index, ขนาด storage เทียบกับ FTS5 (671KB)?
4. เมื่อไหร่ semantic ถึงจะแพ้ keyword/exact matching จริงๆ (เช่น query ที่มี identifier ตรงตัวแบบ `q-exact-*` ที่ทั้งสอง backend ก่อนหน้าทำได้ recall 1.00)?
