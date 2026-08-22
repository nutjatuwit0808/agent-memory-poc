# memory-workshop

Case study สำหรับเรียนรู้กลไกการจัดการ memory ของ agent ด้วยการ**เขียนเองทุกบรรทัด** (ไม่ใช้ framework สำเร็จรูปอย่าง Cognee/LangChain memory) — เปรียบเทียบ search backend 3 แบบ (ripgrep, SQLite FTS5, vector embedding) บน vault ข้อมูลชุดเดียวกัน ด้วย**ตัวเลขที่วัดจริง** ไม่ใช่ทฤษฎี

รายละเอียดเป้าหมาย/หลักการออกแบบ/กติกาทั้งหมด: [`CLAUDE.md`](CLAUDE.md) · สถานะงานแบบละเอียด: [`CHECKLIST.md`](CHECKLIST.md) · แผนงานแต่ละ phase: [`plans/`](plans/README.md)

---

## 1. ภาพรวมโปรเจกต์

โจทย์หลัก: **agent จะค้นความรู้เก่าของตัวเอง (memory) ได้ยังไง** — โปรเจกต์นี้ตอบด้วยการสร้าง "vault" ความรู้จำลอง (เอกสารบริษัทสมมติ PayFlow 55 ไฟล์) แล้วเขียน search backend 3 แบบไล่ระดับความซับซ้อนขึ้นเรื่อยๆ วัดผลบน query set เดียวกันทุกครั้ง เพื่อให้เห็น trade-off จริงระหว่าง **ความเร็ว, ความแม่นยำ, ต้นทุน setup** — ไม่มีคำตอบเดียวที่ถูกเสมอ

หลักการออกแบบสำคัญ: ทุก decision ต้องคำนวณได้ (deterministic) — **ห้าม LLM เป็นคนตัดสินใจ** ไม่ว่าจะ routing, ranking, หรือ classification

---

## 2. วิธีใช้งาน

### ติดตั้ง

```bash
npm install
```

**ต้องมี `rg` (ripgrep) อยู่ใน PATH ก่อนใช้งาน** — ถ้าไม่มี backend ที่เกี่ยวข้องจะ error พร้อมคำสั่งติดตั้งตาม OS ให้เอง

### คำสั่งหลัก

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run reindex` | build/update SQLite FTS5 index แบบ incremental (เทียบ content hash ต่อไฟล์) |
| `npm run reindex -- --full` | rebuild index ทั้งหมดจากศูนย์ |
| `npm run bench` | รันทุก backend + router บน query set เดียวกัน พิมพ์ตาราง markdown เทียบผล |
| `npm run bench -- --backend=<name>` | รันเฉพาะ backend เดียว (`ripgrep`, `fts5`, `vector`, `router-route`, `router-fuse`) |
| `npm run serve` | เปิด search API ที่ `localhost:4000` (สำหรับ UI เปรียบเทียบ) |
| `npm run test` | unit test ของ query classifier + RRF fusion |
| `npm run typecheck` | ตรวจ type ทั้งโปรเจกต์ (strict mode) |

### UI เปรียบเทียบ (พิมพ์ query เองแล้วเห็นผลจาก 5 backend พร้อมกัน)

ต้องรัน 2 process:

```bash
npm run serve            # terminal 1 — search engine ที่ :4000
cd web && npm run dev    # terminal 2 — UI ที่ :3000
```

โมเดล embedding (~465MB) ดาวน์โหลดอัตโนมัติครั้งแรกที่เรียก vector backend แล้ว cache ไว้ที่ `data/models/`

### ลบข้อมูลแล้วเริ่มใหม่ได้เสมอ

ทุกอย่างใน `data/` (SQLite index, embedding cache, model cache) เป็น **derived state** — ลบทิ้งได้ทั้งโฟลเดอร์แล้ว `npm run reindex -- --full` ใหม่ ข้อมูลจริงอยู่ที่ `vault/` เท่านั้น (source of truth)

---

## 3. โครงสร้างโปรเจกต์

```
vault/              ข้อมูลจริง (source of truth) — เอกสาร 55 ไฟล์ แบ่ง 5 layer
src/core/           backend-agnostic: type, frontmatter parser, vault reader (freeze หลัง Phase 0)
src/search/         search backend ทั้งหมด + router (เพิ่มไฟล์ใหม่ได้เรื่อยๆ)
  backends/           ripgrep / fts5 / vector backend, chunking, embedding cache
  router.ts           query classifier + RRF fusion
src/cli/            bench.ts (เทียบ backend), reindex.ts (build SQLite index)
bench/              query set + ground truth (queries.json), บันทึกเคสทดสอบ (vault-cases.md)
data/               derived state ทั้งหมด (SQLite, model cache, embedding cache) — ลบได้เสมอ
workshops/           README ผลการทดลองแต่ละบท (4 บท)
```

---

## 4. เทคโนโลยีที่ใช้

| หมวด | เครื่องมือ | เหตุผลที่เลือก |
|---|---|---|
| Runtime | Node.js (`tsx` รัน TypeScript ตรงๆ ไม่ build) | ตัวเลข bench บน runtime มาตรฐานสื่อความหมายกับคนอ่านได้ตรงกว่า |
| Validation | `zod` | validate frontmatter ของทุก note ให้ error ชัดเจน ไม่ปล่อยผ่านเงียบๆ |
| YAML parsing | `yaml` | ใช้แค่ parse ตัว body ของ frontmatter (ตัวแบ่ง `---` เขียนเอง) |
| Keyword search | system `rg` (spawn subprocess) | zero dependency, เห็นชัดว่า search คือการยิง subprocess จริง |
| Full-text index | `better-sqlite3` (SQLite FTS5) | sync API อ่านง่าย, FTS5 มาพร้อม compile options แน่นอน |
| Embedding model | `@huggingface/transformers` รัน `paraphrase-multilingual-MiniLM-L12-v2` ในเครื่อง | ทำซ้ำได้ 100%, offline, รองรับภาษาไทย |
| ANN vector index | `@lancedb/lancedb` | ทดลอง approximate nearest neighbor เทียบ brute-force |

**ไม่ใช้:** ORM, framework memory สำเร็จรูป (Cognee/LangChain memory), LLM ในเส้นทางตัดสินใจใดๆ

---

## 5. สิ่งที่ทดสอบ — 5 Workshop

### Workshop 01 — ripgrep (search แบบไม่มี index)

ทดสอบว่า search โดยไม่มี index ทำงานยังไง และ latency โตตามขนาด corpus แบบไหน — พบว่าโตเป็นเส้นตรงจริง (34ms → 422ms เมื่อไฟล์เพิ่ม 55 → 5,500) และคะแนนมี **length bias** (note ยาวชนะทั้งที่ไม่เกี่ยวมากกว่า) → [รายละเอียด](workshops/01-ripgrep/README.md)

### Workshop 02 — SQLite FTS5 (inverted index + BM25)

ทดสอบว่า index ช่วยอะไรบ้าง และ "index stale" (ข้อมูลใน index ไม่ตรงกับไฟล์จริง) เป็นปัญหายังไง — พบว่าเร็วกว่า ripgrep **427 เท่า** และคุ้มทุนตั้งแต่ query แรก (break-even < 1 query) แต่ tokenizer มาตรฐานตัดคำไทยไม่ได้ (ไทยไม่มีช่องว่างคั่นคำ) → [รายละเอียด](workshops/02-fts5-index/README.md)

### Workshop 03 — Vector embedding (semantic search)

ทดสอบว่า semantic search ชนะ/แพ้ keyword search ตรงไหน และ ANN (LanceDB) คุ้มกว่า brute-force เมื่อไหร่ — พบว่า semantic recall ดีขึ้นจาก 0.07 เป็น 0.67 แต่ recall ของ query แบบ identifier ตรงตัว (เช่น env var) ร่วงจาก 1.00 เหลือ 0.47 และเจอบั๊กจริงใน LanceDB default index (`IVF_PQ` ทำ recall เหลือ 0.20 ที่ 100k เวกเตอร์ แก้ด้วย `IVF_FLAT`) → [รายละเอียด](workshops/03-vector-search/README.md)

### Workshop 04 — Hybrid router (route / fuse)

ทดสอบว่า router ที่เลือก backend อัตโนมัติ (deterministic ล้วนๆ ไม่มี LLM) คุ้มความซับซ้อนที่เพิ่มมาไหม — พบว่า `route` (เลือก backend เดียวตามรูปร่าง query) ได้ recall 0.87 โดยแทบไม่เสีย latency ส่วน `fuse` (ยิงทุก backend แล้วรวมด้วย RRF) ได้ recall สูงสุด 0.92 แต่แพงกว่า route ถึง 209 เท่า → [รายละเอียด](workshops/04-hybrid-router/README.md)

### Workshop 05 — Frontend เปรียบเทียบ (Next.js)

ทดสอบว่าความต่างที่ `bench` วัดได้ **มองเห็นด้วยตาตอนพิมพ์เองไหม** — พบว่าเห็นชัดจนสลับกันแพ้ชนะได้ในสองคลิก (query identifier: vector recall 0.00 ส่วน ripgrep/fts5 1.00 · query semantic: กลับด้านสมบูรณ์) และพบบทเรียนที่ตาราง bench ไม่เคยบอก: **overhead คงที่ 15ms ของ HTTP กลบความเร็ว 87 เท่าของ fts5 ให้เหลือแค่ 3.2 เท่า** ถ้าวัดเวลาผิดที่ → [รายละเอียด](workshops/05-frontend/README.md)

---

## 6. ผลสรุปสุดท้าย

เครื่องที่วัด: Node.js v26.2.0, Windows 11 Home, Intel Core Ultra 7 265 — vault 55 notes (161,968 bytes)

| backend | p50 (ms) | recall@5 | build (ms) | index size | ชนะที่ query kind |
|---|---|---|---|---|---|
| ripgrep | ~29–33 | 0.74 | 0 | 0 | `exact` (1.00) |
| fts5 | ~0.06 | 0.72 | ~3 | 671,744 bytes | `keyword` (1.00) |
| vector | ~0.14 | 0.78 | ~15–20 | 350,208 bytes | `semantic` (0.67) |
| **router (route)** | ~0.19 | **0.87** | ~16 | 1,021,952 bytes | ผสมตามกฎ deterministic |
| **router (fuse)** | ~29 | **0.92** | ~15 | 1,021,952 bytes | recall สูงสุด แลก latency 209× |

*recall/precision/MRR reproducible 100% ทุกครั้งที่รัน — latency แกว่ง ±5–15% ตามปกติของ wall-clock benchmark*

### สรุปแบบเลือกใช้

- **ไม่มี backend ไหนชนะทุกอย่าง** — แต่ละตัวมีจุดแข็งคนละจุด
- Vault ขนาดเล็ก (หลักสิบ-ร้อยไฟล์): **FTS5 เดี่ยวๆ** คุ้มที่สุด (setup ต่ำ เร็วสุด)
- ต้องการ semantic เพิ่มโดยไม่แลก latency: **router (route)**
- งานที่ไม่ sensitive latency (batch/report) ต้องการ recall สูงสุด: **router (fuse)**
- **ANN ยังไม่คุ้มที่ scale นี้** — brute-force เร็ว/แม่นกว่าจนกว่าจะถึงหลักหมื่นเวกเตอร์ขึ้นไป
