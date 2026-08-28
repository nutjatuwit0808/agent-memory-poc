# memory-workshop

Case study สำหรับเรียนรู้กลไกการจัดการ memory ของ agent ด้วยการ**เขียนเองทุกบรรทัด** (ไม่ใช้ framework สำเร็จรูปอย่าง Cognee/LangChain memory) — เปรียบเทียบ search backend 3 แบบ (ripgrep, SQLite FTS5, vector embedding) บน vault ข้อมูลชุดเดียวกัน ด้วย**ตัวเลขที่วัดจริง** ไม่ใช่ทฤษฎี

รายละเอียดเป้าหมาย/หลักการออกแบบ/กติกาทั้งหมด: [`CLAUDE.md`](CLAUDE.md) · สถานะงานแบบละเอียด: [`CHECKLIST.md`](CHECKLIST.md) · แผนงานแต่ละ phase: [`plans/`](plans/README.md) · template ไฟล์ vault: [`docs/vault-file-templates.md`](docs/vault-file-templates.md)

---

## สารบัญ

- [สรุปผลการทดลอง (TL;DR)](#สรุปผลการทดลอง-tldr)
  - [Hybrid (router) ดีกว่าจุดอื่นยังไง](#hybrid-router-ดีกว่าจุดอื่นยังไง)
  - [ข้อเสียของ hybrid](#ข้อเสียของ-hybrid)
- [1. ภาพรวมโปรเจกต์](#1-ภาพรวมโปรเจกต์)
- [2. วิธีใช้งาน](#2-วิธีใช้งาน)
  - [ติดตั้ง](#ติดตั้ง)
  - [คำสั่งหลัก](#คำสั่งหลัก)
  - [UI เปรียบเทียบ](#ui-เปรียบเทียบ-พิมพ์-query-เองแล้วเห็นผลจาก-5-backend-พร้อมกัน)
  - [ลบข้อมูลแล้วเริ่มใหม่ได้เสมอ](#ลบข้อมูลแล้วเริ่มใหม่ได้เสมอ)
- [3. โครงสร้างโปรเจกต์](#3-โครงสร้างโปรเจกต์)
- [4. เทคโนโลยีที่ใช้](#4-เทคโนโลยีที่ใช้)
- [5. สิ่งที่ทดสอบ — 7 Workshop](#5-สิ่งที่ทดสอบ--7-workshop)
  - [Workshop 01 — ripgrep](#workshop-01--ripgrep-search-แบบไม่มี-index)
  - [Workshop 02 — SQLite FTS5](#workshop-02--sqlite-fts5-inverted-index--bm25)
  - [Workshop 03 — Vector embedding](#workshop-03--vector-embedding-semantic-search)
  - [Workshop 04 — Hybrid router](#workshop-04--hybrid-router-route--fuse)
  - [Workshop 05 — Frontend เปรียบเทียบ](#workshop-05--frontend-เปรียบเทียบ-nextjs)
  - [Workshop 06 — Graph traversal](#workshop-06--graph-traversal-wikilink-ที่มีอยู่แล้ว)
  - [Workshop 07 — Cross-encoder reranking](#workshop-07--cross-encoder-reranking-2-stage-retrieval)
- [6. เปรียบเทียบ — ข้อดี ข้อเสีย และเหมาะกับกรณีไหน](#6-เปรียบเทียบ--ข้อดี-ข้อเสีย-และเหมาะกับกรณีไหน)
  - [6.1 ตารางรวม](#61-ตารางรวม)
  - [6.2 recall@5 แยกตามประเภท query](#62-recall5-แยกตามประเภท-query--ตารางที่บอกความต่างจริง)
  - [6.3 ข้อดี–ข้อเสีย และเหมาะกับกรณีไหน](#63-ข้อดีข้อเสีย-และเหมาะกับกรณีไหน)
  - [6.4 ต้นทุนที่ต้องจ่าย](#64-ต้นทุนที่ต้องจ่าย-setup--maintenance)
  - [6.5 เลือกยังไง](#65-เลือกยังไง)
- [7. Scale test — 55 → 1,000 → 1,945 ไฟล์](#7-scale-test--55--1000--1945-ไฟล์)
  - [Setup](#setup)
  - [7.1 recall ตกลงจริง](#71-recall-ตกลงจริง-ยิ่ง-scale-ใหญ่ยิ่งตกมากขึ้น)
  - [7.2 latency โต sub-linear](#72-latency-โต-sub-linear-เกือบทุกตัว-ยกเว้น-vector)
  - [7.3 MCP overhead](#73-mcp-overhead-sub-linear-จนถึง-1000-ไฟล์-แล้วพลิกกลับที่-1945)
  - [7.4 RAM ของ vector backend](#74-ram-ของ-vector-backend-ไม่ใช่ปัญหาที่-scale-นี้)
  - [7.5 เชิงคุณภาพผ่าน Cursor จริง](#75-เชิงคุณภาพ--ทดสอบผ่าน-cursor-จริง-agent-mode-ที่-1945-ไฟล์)
  - [7.6 แก้จริงด้วย domain facet](#76-แก้จริง--เพิ่ม-domain-facet-กู้-recall-กลับมาได้แค่ไหน)
  - [7.7 recall/MRR ไม่ reproducible ที่ scale ใหญ่](#77-พบว่า-recallmrr-ไม่-reproducible-100-ที่-scale-ใหญ่-finding-ที่ยังไม่ได้แก้)
  - [สรุปหัวข้อ 7](#สรุปหัวข้อ-7)
- [`docs/vault-file-templates.md`](docs/vault-file-templates.md) — template ไฟล์ vault แยกไว้ต่างหาก (path/frontmatter/content ต่อ layer + flow diagram)

---

## สรุปผลการทดลอง (TL;DR)

**บทสรุปหลัก:** ไม่มี backend เดี่ยวตัวไหนชนะทุกกรณี — แต่ละตัว **แพ้ชนะกันคนละจุดโดยสิ้นเชิง**:

| backend | จุดแข็ง | จุดที่พังจริง (ไม่ใช่แค่แม่นน้อยกว่า) |
|---|---|---|
| ripgrep / fts5 | exact/keyword recall **1.00** | semantic recall **0.07** — เกือบทุก query ได้ผลว่างเปล่า |
| vector | semantic recall **0.67** | exact recall ร่วงเหลือ **0.47** — หาชื่อ env var ไม่เจอ |

### Hybrid (router) ดีกว่าจุดอื่นยังไง

- **route mode** (เลือก backend เดียวตามรูปร่าง query แบบ deterministic ล้วน ไม่มี LLM): recall รวม **0.87** — สูงกว่า backend เดี่ยวที่ดีที่สุด +11.5% — โดยแทบไม่เสีย latency (p50 ~0.19ms เกือบเท่าตัวที่เร็วสุด)
- **fuse mode** (ยิงทุก backend พร้อมกันแล้วรวมด้วย RRF): recall สูงสุด **0.92** และกำจัดจุดอ่อนของทุกตัวพร้อมกัน (ช่อง `filtered` ที่ route ยังพลาดอยู่ (0.80) fuse ได้กลับมา 1.00 เต็ม)
- สรุปคือ hybrid ไม่ต้อง "เลือกแล้วทนรับจุดอ่อน" เหมือน backend เดี่ยว — ให้ query แต่ละแบบได้เครื่องมือที่เหมาะกับมันเอง

### ข้อเสียของ hybrid

- **ต้อง build/maintain index ครบทุก backend ข้างใน** — ต้นทุน setup สูงสุดในบรรดาตัวเลือกทั้งหมด (รวม 3 dependency: `rg`, SQLite, embedding model 465MB)
- **route mode:** กฎ classifier ต้อง tune เอง ยังมีจุดอ่อนหลุดมา (query สั้นภาษาไทยถูกส่งไป fts5 ที่ตัดคำไม่ได้) และถ้ากฎ route ผิด **ไม่มีตัวสำรอง** — ได้ผลของ backend ที่ผิดเต็มๆ ไปเลย (ต่างจาก fuse ที่ถามทุกตัวพร้อมกัน)
- **fuse mode:** ช้ากว่า route ถึง **209 เท่า** (29ms vs 0.14ms) เพราะต้องรอ backend ที่ช้าที่สุดเสมอ และต้นทุน compute เท่ากับรันทั้ง 3 backend พร้อมกันทุก query

รายละเอียดตัวเลขเต็ม + ตัวอย่าง query ที่ชนะ/แพ้จริงแต่ละตัว: [หัวข้อ 6](#6-เปรียบเทียบ--ข้อดี-ข้อเสีย-และเหมาะกับกรณีไหน) ด้านล่าง

**อยากรู้ว่าตัวเลขพวกนี้ยัง hold อยู่ไหมที่ vault ใหญ่ขึ้น 35 เท่า (55→1,945 ไฟล์)?** ดู [หัวข้อ 7 — Scale test](#7-scale-test--55--1000--1945-ไฟล์) — สรุปสั้นๆ: **recall ตกลงจริง** (vector หนักสุด 0.78→0.53) แต่ **latency แทบไม่ขยับ** และการใช้งานจริงผ่าน AI agent (Cursor + MCP) **ยังตอบถูก 100%** แม้ recall ดิบจะตกก็ตาม

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
docs/                เอกสารอ้างอิง — template ไฟล์ vault (path/frontmatter/content ต่อ layer)
```

**อยากรู้ว่าไฟล์ใน `vault/` แต่ละไฟล์ควรมีโครงสร้างยังไง (path, frontmatter, เนื้อหาต่อ layer)?** ดู [`docs/vault-file-templates.md`](docs/vault-file-templates.md) — สรุปจาก 1,890 ไฟล์ที่เขียนจริงและวัดผลแล้วในหัวข้อ 7

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

## 5. สิ่งที่ทดสอบ — 7 Workshop

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

### Workshop 06 — Graph traversal (wikilink ที่มีอยู่แล้ว)

ทดสอบว่า link graph ที่ `core/` parse เก็บไว้ตั้งแต่ Phase 0 แต่ไม่มี backend ไหนแตะเลยตลอด WS01–05 มีค่าจริงไหม — เพิ่ม query kind ใหม่ `multi-hop` (5 ข้อ) แล้วพบว่า graph expansion (seed จาก router-route ขยาย 1 hop) ดัน recall รวมจาก 0.82 เป็น **0.86** ที่ latency แทบไม่ต่าง (0.19ms) และช่วย `semantic` ทุก backend อย่างสม่ำเสมอ (+0.13) แต่ก็มี noise จริงที่บาง kind ร่วง (`ripgrep+keyword` −0.10) ยืนยันว่า 2 hop แย่กว่า 1 hop เสมอ → [รายละเอียด](workshops/06-graph-traversal/README.md)

### Workshop 07 — Cross-encoder reranking (2-stage retrieval)

ทดสอบว่า reranking (cross-encoder จัดอันดับใหม่จาก candidate ที่ backend เดิมคัดมา) คุ้มไหมเมื่อ `router-fuse` แทบชนเพดานทฤษฎีอยู่แล้ว — คำนวณ oracle ceiling ก่อนพบว่า `fuse` มี gap = 0.000 (rerank ช่วยไม่ได้เลย) แต่ `vector` มี gap 0.073 โดยเฉพาะ query แบบ `exact` (identifier) ที่ gap สูงถึง 0.23 ลองจริงพบว่า `rerank(vector, topN=10)` ได้ recall 0.827 **ตรงกับ oracle ที่คำนวณไว้เป๊ะ** แต่แพงกว่า `router-fuse` มาก (topN=50 ชนะ recall ได้จริงแต่ช้ากว่า 114 เท่า) → [รายละเอียด](workshops/07-reranking/README.md)

---

## 6. เปรียบเทียบ — ข้อดี ข้อเสีย และเหมาะกับกรณีไหน

เครื่องที่วัด: Node.js v26.2.0, Windows 11 Home, Intel Core Ultra 7 265 — vault 55 notes (161,968 bytes)
*recall/precision/MRR reproducible 100% ทุกครั้งที่รัน — latency แกว่ง ±5–15% ตามปกติของ wall-clock benchmark*
*(คำกล่าวนี้ยืนยันแล้วว่าจริงที่ scale 55 ไฟล์ — แต่ **ไม่ hold ที่ scale ใหญ่ (1,945 ไฟล์)** อีกต่อไป ดู [หัวข้อ 7.7](#77-พบว่า-recallmrr-ไม่-reproducible-100-ที่-scale-ใหญ่-finding-ที่ยังไม่ได้แก้))*

### 6.1 ตารางรวม

| backend | p50 (ms) | p95 (ms) | recall@5 | precision@5 | MRR | build (ms) | index size |
|---|---|---|---|---|---|---|---|
| ripgrep | ~29–33 | ~33–52 | 0.74 | 0.27 | 0.74 | 0 | 0 |
| fts5 | **~0.06** | **~0.16** | 0.72 | 0.25 | 0.75 | ~3 | 671,744 B |
| vector | ~0.14 | ~0.30 | 0.78 | 0.26 | 0.79 | ~15–20 | 350,208 B |
| **router (route)** | ~0.19 | ~30 | **0.82–0.87** | 0.30–0.31 | 0.84 | ~16 | 1,021,952 B |
| **router (fuse)** | ~29 | ~33 | **0.92–0.93** | **0.33–0.38** | **0.92–0.93** | ~15 | 1,021,952 B |
| **graph** (WS06) | ~0.19 | ~30 | **0.86** | 0.34 | 0.81 | ~13 | 806,672 B |

*ช่วงตัวเลขของ router เกิดจาก query set ที่โตขึ้นหลัง WS06 (20→25 ข้อ เพิ่ม kind `multi-hop`) — ตัวเลขต่ำกว่าคือก่อนเพิ่ม, สูงกว่าคือหลังเพิ่ม*

### 6.2 recall@5 แยกตามประเภท query — ตารางที่บอกความต่างจริง

ค่าเฉลี่ยรวมในตาราง 6.1 ปิดบังความต่างไว้เกือบหมด (ripgrep 0.74 กับ fts5 0.72 ดูพอกัน) แต่พอแยกตามประเภท query จะเห็นว่าแต่ละตัว**แพ้ชนะกันคนละจุดโดยสิ้นเชิง**

| backend | `exact`<br/>(ชื่อ env var / function) | `keyword`<br/>(คำสั้นทั่วไป) | `semantic`<br/>(ถามด้วยภาษาคน) | `filtered`<br/>(ระบุ layer) |
|---|---|---|---|---|
| ripgrep | **1.00** | 0.90 | **0.07** ❌ | **1.00** |
| fts5 | **1.00** | **1.00** | **0.07** ❌ | 0.80 |
| vector | **0.47** ❌ | **1.00** | **0.67** ✅ | **1.00** |
| router (route) | **1.00** | **1.00** | **0.67** | 0.80 |
| router (fuse) | **1.00** | **1.00** | **0.67** | **1.00** |

**อ่านตารางนี้ยังไง:**
- ช่อง ❌ คือจุดที่ backend นั้น**ใช้งานไม่ได้จริง** ไม่ใช่แค่ "แม่นน้อยกว่า" — recall 0.07 แปลว่าเกือบทุก query ได้ผลลัพธ์ว่างเปล่า
- **ripgrep กับ fts5 พังที่เดียวกันเป๊ะ** (semantic 0.07 ทั้งคู่) เพราะทั้งคู่คือ literal matching เหมือนกัน ต่างกันแค่เร็วแค่ไหน ไม่ใช่ "ฉลาด" แค่ไหน
- **vector สลับด้านกับสองตัวแรก** — ชนะ semantic แต่ร่วงที่ exact เพราะ embedding มองชื่อ `PAYMENT_GATEWAY_TIMEOUT_MS` เป็นแค่ "คำแปลกๆ" ที่ไม่มีความหมายทางภาษา
- **router (route) รับจุดอ่อนของ fts5 มาที่ช่อง `filtered` (0.80)** เพราะ query อย่าง `timeout` / `คืนเงิน` สั้นพอที่จะเข้ากฎ `short-keyword` แล้วถูกส่งไป fts5 ซึ่ง tokenizer ตัดคำไทยไม่ได้ — ส่วน fuse แก้จุดนี้ได้ (1.00) เพราะถาม vector ควบคู่ไปด้วย

### 6.3 ข้อดี–ข้อเสีย และเหมาะกับกรณีไหน

#### ripgrep — "อ่านของจริงทุกครั้ง"

| ข้อดี | ข้อเสีย |
|---|---|
| ไม่ต้อง build index เลย (0ms, 0 byte) | latency โตเป็นเส้นตรง: 34ms → **422ms** เมื่อไฟล์ 55 → 5,500 |
| **ไม่มีปัญหา stale เด็ดขาด** — อ่านไฟล์จริงทุกครั้ง | คะแนนมี **length bias** (ไม่มี IDF/normalization) |
| ค้น identifier ตรงตัวแม่น 100% | semantic ใช้ไม่ได้เลย (0.07) |
| ติดตั้งง่าย ไม่มี dependency ใน repo | filter เป็น post-filter → **ใส่ filter แล้วไม่เร็วขึ้น** (+2%) |

**เหมาะกับ:** ค้นแบบ one-off ที่ไม่คุ้มจะสร้าง index, ไฟล์เปลี่ยนตลอดเวลาจน index ตามไม่ทัน, corpus เล็กกว่าหลักพันไฟล์
**ตัวอย่างที่ชนะ:** ค้น `MAX_RETRY_ATTEMPTS` → เจอครบทุกไฟล์ที่มีจริง
**ตัวอย่างที่แพ้:** ค้น `"จ่ายเงินด้วยบัตรแล้วไม่ผ่านซ้ำๆ ควรทำยังไง"` → **ไม่พบผลลัพธ์เลย** หลังเสียเวลาไป 43ms · และค้น `order` → ไฟล์ยาว 632 คำที่พูดถึง order แค่ผ่านๆ ชนะ `module-order.md` ที่เป็นเอกสารตัวจริง

#### fts5 — "เร็วที่สุด ถูกที่สุด"

| ข้อดี | ข้อเสีย |
|---|---|
| **เร็วกว่า ripgrep ~427 เท่า** (0.06ms vs 29ms) | **index stale ได้** — แก้ไฟล์แล้วต้อง reindex เอง |
| คุ้มทุนตั้งแต่ query แรก (break-even < 1 query) | **tokenizer ตัดคำไทยไม่ได้** |
| BM25 แก้ length bias ที่ ripgrep มี | semantic ใช้ไม่ได้เลย (0.07) เท่า ripgrep |
| filter ทำใน SQL → ใส่ filter แล้ว **เร็วขึ้น 48%** | index กินพื้นที่ ~4.1 เท่าของ vault ดิบ |

**เหมาะกับ:** ระบบที่ query บ่อยแต่ข้อมูลเปลี่ยนไม่บ่อย, corpus ภาษาอังกฤษเป็นหลัก, ต้องการ latency ต่ำสุดโดยไม่มีต้นทุน setup หนัก
**ตัวอย่างที่ชนะ:** `MATCH 'refund'` → เจอ **31 ไฟล์** ใน 0.06ms
**ตัวอย่างที่แพ้:** `MATCH 'คืนเงิน'` → เจอ **1 ไฟล์เท่านั้น** ทั้งที่คำนี้อยู่ในเนื้อหาหลายสิบครั้ง เพราะ `unicode61` มองประโยคไทยทั้งประโยคเป็น token เดียวยาวๆ

#### vector — "เข้าใจความหมาย"

| ข้อดี | ข้อเสีย |
|---|---|
| **semantic recall 0.07 → 0.67** (ดีขึ้น ~10 เท่า) | **exact recall ร่วงเหลือ 0.47** — ค้นชื่อ env var ไม่เจอ |
| ข้ามภาษาได้: cos("คืนเงิน","refund") = **0.7654** | โมเดล **465MB** ต้องโหลดก่อนใช้ |
| **ไม่มีปัญหา tokenizer ไทย** เพราะไม่พึ่ง token boundary | cold cache: embed ทั้ง vault ใช้ **4,543ms** |
| index เล็กกว่า fts5 (350KB vs 672KB) | query แรกหลัง index ช้า **~1,250ms** (ONNX compile) |
| filter ลดงาน 36–53% | ต้อง embed query ทุกครั้ง — ต้นทุนย้ายมาที่ query path |

**เหมาะกับ:** ผู้ใช้พิมพ์คำถามด้วยภาษาตัวเอง, เนื้อหาหลายภาษาปนกัน, กรณีที่ synonym เยอะ (คืนเงิน/refund/ยกเลิกรายการ)
**ตัวอย่างที่ชนะ:** `"ราคาที่เห็นหน้าเว็บรวมภาษีหรือยัง"` → เจอ `tax-calculation.md` อันดับ 1 ทั้งที่ query ไม่มีคำว่า "VAT" เลย
**ตัวอย่างที่แพ้:** `PAYMENT_GATEWAY_TIMEOUT_MS` → recall **0.00** แถมไปเจอ 3 ไฟล์ที่ไม่มี backend อื่นเจอ (คือมั่นใจในคำตอบที่ผิด)

#### router (route) — "เลือกเครื่องมือตามงาน"

| ข้อดี | ข้อเสีย |
|---|---|
| **recall 0.87** สูงกว่า backend เดี่ยวที่ดีที่สุด (+11.5%) | ต้อง index ครบทั้ง 3 ตัว (1,021,952 B) |
| p50 ~0.19ms — เกือบเท่า backend ที่เร็วที่สุด | **p95 พุ่งถึง ~30ms** เมื่อ query ถูกส่งไป ripgrep |
| อธิบายได้ทุก query ว่าเข้ากฎไหน (`routedBy`) | กฎ classifier ต้อง tune เอง (เช่นช่อง `filtered` ที่ยังได้ 0.80) |
| ไม่มี LLM — deterministic 100% | ถ้า route ผิด จะได้ผลของ backend ที่ผิดเต็มๆ ไม่มีตัวสำรอง |

**เหมาะกับ:** user-facing search ที่ต้องการทั้งความเร็วและ recall — เป็นตัวเลือก default ที่คุ้มที่สุดถ้าไม่ติดข้อจำกัดเรื่อง setup

#### router (fuse) — "ถามทุกคนแล้วโหวต"

| ข้อดี | ข้อเสีย |
|---|---|
| **recall 0.92 / precision 0.33 / MRR 0.93** สูงสุดทุกตัว | **ช้ากว่า route ~209 เท่า** (29ms vs 0.14ms) |
| ไม่มีจุดอ่อนของ backend ตัวใดตัวหนึ่ง (`filtered` กลับมา 1.00) | ต้องรอ backend ที่ช้าที่สุดเสมอ |
| RRF รวมอันดับได้โดยไม่ต้อง normalize คะแนนข้ามสเปซ | ต้นทุน compute เท่ากับรัน 3 backend พร้อมกัน |

**เหมาะกับ:** งานที่ไม่ sensitive latency — batch job, สร้างรายงาน, งานที่พลาดแล้วเสียหายมากกว่าช้า

### 6.4 ต้นทุนที่ต้องจ่าย (setup / maintenance)

| backend | ต้องมีอะไรก่อนใช้ | ต้อง maintain อะไร | cold start |
|---|---|---|---|
| ripgrep | binary `rg` ใน PATH | **ไม่มี** | ทันที |
| fts5 | `better-sqlite3` | **ต้อง reindex เมื่อไฟล์เปลี่ยน** ไม่งั้นได้ผลเก่า | ~17–29ms |
| vector | โมเดล 465MB + embedding cache | reindex + cache ผูกกับชื่อโมเดล (เปลี่ยนโมเดล = cache ใช้ไม่ได้ทั้งหมด) | **~4,543ms** (cold) / ~1,250ms (query แรก) |
| router | ทุกอย่างข้างบนรวมกัน | ทุกอย่างข้างบนรวมกัน | ตามตัวที่ช้าที่สุด |

### 6.5 เลือกยังไง

| ถ้าสถานการณ์คือ… | เลือก | เพราะ |
|---|---|---|
| corpus เล็ก ภาษาอังกฤษ ต้องการเริ่มเร็วที่สุด | **fts5** | เร็วสุด ต้นทุน setup ต่ำ recall รวมใกล้เคียง ripgrep |
| ผู้ใช้พิมพ์คำถามเป็นภาษาคน / เนื้อหาไทยเยอะ | **router (route)** | ได้ semantic โดยไม่เสีย exact และไม่แลก latency มาก |
| ต้องการ recall สูงสุด ไม่แคร์เวลา | **router (fuse)** | สูงสุดทุก metric แลกด้วย latency 209× |
| ไฟล์เปลี่ยนตลอดเวลา / รันครั้งเดียวจบ | **ripgrep** | ไม่มี index ให้ stale และไม่มีต้นทุน build |
| corpus ใหญ่เกินหลักหมื่นเวกเตอร์ | vector + **ANN (`IVF_FLAT`)** | brute-force เริ่มแพ้ ANN ที่ ~10k เวกเตอร์ |

**ข้อควรระวังที่เจอจากการวัดจริง:**
- **ANN ยังไม่คุ้มที่ scale นี้เลย** — ที่ 55 notes brute-force เร็วกว่าและแม่น 100% เสมอ · จุดตัดอยู่ที่หลักหมื่นเวกเตอร์ขึ้นไป
- **ถ้าจะใช้ ANN ระวัง default ของ LanceDB** — `createIndex()` เปล่าๆ ใช้ `IVF_PQ` (บีบอัดแบบ lossy) ทำให้ recall@10 เหลือ **0.20** ที่ 100k เวกเตอร์ · สลับเป็น `IVF_FLAT` แล้วกลับมา **0.98** พร้อมยังเร็วกว่า brute-force 4 เท่า
- **อย่าวัด latency ผิดที่** — วัดฝั่ง client จะได้ HTTP overhead ~15ms ปนมาด้วย ซึ่งกลบความเร็ว 87 เท่าของ fts5 ให้เหลือแค่ 3.2 เท่า (ดู WS05)

---

## 7. Scale test — 55 → 1,000 → 1,945 ไฟล์

> ส่วนขยาย นอกเหนือจาก Workshop 01–07 ด้านบน — ทดสอบว่าตัวเลขทั้งหมดที่วัดจาก vault 55 ไฟล์จริงยัง hold อยู่ไหมเมื่อ corpus ใหญ่ขึ้น รายละเอียดเต็มอยู่ที่ [`CHECKLIST.md`](CHECKLIST.md) และ [`plans/11-scale-1000.md`](plans/11-scale-1000.md)

### Setup

vault เดิม 55 ไฟล์จริง (PayFlow) **ไม่ถูกแตะเลย** — เพิ่ม synthetic distractor 1,890 ไฟล์จาก 30 โดเมนธุรกิจสมมติที่**ไม่เกี่ยวกับ payment/refund/order เลย** (คลังสินค้าหุ่นยนต์, เวชระเบียน, ตั๋วงานอีเวนต์, ประกันภัยรถยนต์ ฯลฯ) เขียนเนื้อหาจริงทุกไฟล์ (ไม่ใช่ template สุ่ม) เพื่อให้เป็น noise ที่สมจริง รวมเป็น vault **1,945 ไฟล์**

### 7.1 recall ตกลงจริง ยิ่ง scale ใหญ่ยิ่งตกมากขึ้น

| backend | recall@5 @ 55 | recall@5 @ 1,000 | recall@5 @ 1,945 | ตกไปเท่าไหร่ |
|---|---|---|---|---|
| **vector** | 0.78 | 0.63 | **0.53** | **-0.25 (หนักสุด)** |
| router (route) | ~0.845 | 0.71 | 0.65 | -0.195 |
| graph | 0.86 | 0.72 | 0.65 | -0.21 |
| router (fuse) | ~0.925 | 0.85 | **0.81 (ยังดีสุด)** | -0.115 |
| ripgrep | 0.74 | 0.69 | 0.62 | -0.12 |
| **fts5** | 0.72 | 0.67 | **0.67 (นิ่งสุด)** | -0.05 |

**เหตุผล:** ยิ่งมี distractor เยอะ ยิ่งมีโอกาสที่เนื้อหาไม่เกี่ยวข้องแต่ใช้คำศัพท์คล้ายกัน (timeout/retry/policy/incident ซ้ำกันข้ามโดเมน) แซงคำตอบจริงในผลลัพธ์ — **vector เจอหนักสุดเพราะยิ่งมี candidate เยอะยิ่งมีโอกาสแซงมากขึ้นตรงๆ** ส่วน **fts5 นิ่งที่สุด** เพราะ exact/keyword match ไม่สนใจปริมาณ noise เลย

### 7.2 latency โต sub-linear เกือบทุกตัว ยกเว้น vector

| backend | p50 @ 55 | p50 @ 1,000 | p50 @ 1,945 | โตกี่เท่า (ไฟล์โต 35 เท่า) |
|---|---|---|---|---|
| ripgrep | ~30ms | 42.24ms | 53.98ms | 1.8× |
| fts5 | ~0.06ms | 0.12ms | 0.13ms | 2.2× |
| **vector** | ~0.14ms | 1.64ms | 3.46ms | **~25× (เกือบเป็นสัดส่วนตรง)** |
| router (route) | ~0.19ms | 1.72ms | 3.48ms | ~18× |
| router (fuse) | ~29ms | 45.35ms | 54.73ms | 1.9× |

ripgrep/fts5/router-fuse โตช้ามาก (~2 เท่า) เพราะต้นทุนหลักคือ subprocess-spawn (ripgrep) หรือ O(log n) index (fts5) ซึ่งเป็นค่าคงที่ ไม่ได้โตตามจำนวนไฟล์ที่ scan — **vector โตเกือบเป็นสัดส่วนตรงกับไฟล์** เพราะต้อง brute-force cosine similarity เทียบทุก embedding แต่ในหน่วยจริงยังเร็วมาก (3.46ms ที่ 1,945 ไฟล์)

### 7.3 MCP overhead: sub-linear จนถึง 1,000 ไฟล์ แล้วพลิกกลับที่ 1,945

| ตัวชี้วัด | @ 55 ไฟล์ | @ 1,000 ไฟล์ | @ 1,945 ไฟล์ |
|---|---|---|---|
| MCP overhead (absolute) | 0.01ms | 0.12ms | **1.53ms** |
| MCP overhead (% ของ round-trip) | 1.5% | 4.4% | **22.1%** |
| cold start (stdio) | 615ms | 1,935ms | 2,859ms |
| steady state (warm) | 30.5ms | 49ms | **51.3ms (แทบไม่ขยับ)** |

cold start ยัง sub-linear ตลอด (ต้นทุนหลักคือ vector embedding build ที่โตช้ากว่าไฟล์) และ steady state แทบไม่ขยับเลย — ข่าวดีที่สุดคือถ้า MCP server อุ่นแล้ว เรียกซ้ำเร็วเท่าเดิมไม่ว่า scale ไหน **แต่ MCP overhead กลับไม่ sub-linear** ระหว่าง 1,000→1,945 ไฟล์ (ไฟล์โตแค่ ~1.9× แต่ overhead โต ~12.75×) — สาเหตุที่เป็นไปได้คือ payload ที่ JSON-RPC ต้อง serialize/deserialize ใหญ่ขึ้นตาม index size เป็นจุดที่ต้องระวังถ้า scale ไปไกลกว่านี้ แม้ตัวเลข absolute ยังเล็กมาก (1.53ms)

### 7.4 RAM ของ vector backend ไม่ใช่ปัญหาที่ scale นี้

vector backend หลักที่ใช้ (brute-force cosine similarity เขียนเอง ไม่ใช้ LanceDB) **ไม่มี index ถาวรบนดิสก์เลย** — เก็บ vector ทั้งหมดใน RAM ล้วนๆ วัดจริงที่ 1,945 ไฟล์ (5,319 chunks หลัง chunking):

| รายการ | ค่า |
|---|---|
| ขนาด vector ล้วนๆ (ทฤษฎี) | 5,319 chunks × 384 dim × 4 byte = **~7.8MB** |
| RAM ที่เพิ่มขึ้นจริงตอน `index()` (RSS) | **~45MB** (รวม chunk text + ONNX runtime overhead) |

45MB สำหรับ 1,945 ไฟล์ถือว่าน้อยมาก — ต่อให้ไปถึง 10,000 ไฟล์ (~27,000 chunk) ก็ยังใช้ RAM แค่หลักร้อย MB **RAM ไม่ใช่คอขวดของ vector search ที่ scale นี้ — recall ที่ตกลงต่างหากคือปัญหาจริง (7.1)**

### 7.5 เชิงคุณภาพ — ทดสอบผ่าน Cursor จริง (Agent mode) ที่ 1,945 ไฟล์

recall ดิบตกลงจริงตาม 7.1 แต่พอทดสอบผ่าน **agent จริงที่มี reasoning ช่วยกรอง noise** (ไม่ใช่แค่เรียก backend ตรงๆ) ผลกลับต่างไปมาก — ลองยิง 4 query ผ่าน Cursor Agent mode ที่มี MCP tool `search_memory`/`get_memory` ต่ออยู่:

| # | query | ประเภท | ผล |
|---|---|---|---|
| 1 | "ลูกค้าขอคืนเงินแล้วระบบค้าง" | semantic, มี baseline จาก 55 ไฟล์ | ✅ **ไม่ตกเลย** — คำตอบแม่นเท่าเดิมทุกจุด (Case 2891, `REFUND_STUCK_THRESHOLD_MIN`) แถมดึงเคสเพิ่มเติมที่เกี่ยวข้องโดยไม่ถูกถาม |
| 2 | "PAYMENT_GATEWAY_TIMEOUT_MS คืออะไร" | exact identifier | ✅ ผ่าน (บังคับ MCP-only) — เจอไฟล์ถูกต้องครบพร้อม citation |
| 3 | "หุ่นยนต์หยิบสินค้าไม่สำเร็จควร retry กี่ครั้ง" | semantic, เนื้อหาสังเคราะห์ใหม่ล้วนๆ ไม่มีใน ground truth เดิม | ✅ ผ่าน — ยืนยันด้วย grep ตรงไฟล์จริงว่าคำตอบตรงเกือบคำต่อคำ ไม่ใช่ hallucination |
| 4 | "แพทย์เข้าถึงเวชระเบียนผู้ป่วยได้เมื่อไหร่" | semantic, สังเคราะห์ domain อื่น | ✅ ผ่าน — สังเคราะห์คำตอบจาก 3 ไฟล์แยกกันถูกต้องครบ |

**ผ่านครบ 4/4** แม้ recall ดิบจาก `bench.ts` จะตกลงจริงตามที่ 7.1 แสดง — เพราะ agent เลือกเครื่องมือและตีความผลลัพธ์ได้ฉลาดกว่า raw recall (บางครั้งลอง search หลายรอบ, สลับคำค้นไทย/อังกฤษ, หรือใช้ built-in grep แทน MCP เมื่อเหมาะกับ query แบบ exact identifier มากกว่า)

### 7.6 แก้จริง — เพิ่ม `domain` facet กู้ recall กลับมาได้แค่ไหน

รากของปัญหา recall ตกใน 7.1 คือ content ของ `convention`/`deployment` ทั้ง 30 domain สังเคราะห์ถูกสร้างจาก template เดียวกัน วัด cosine similarity จริงได้สูงถึง **0.77-0.89** ระหว่าง domain ต่างกัน (baseline ของ "เนื้อหาไม่เกี่ยวกันจริง" อยู่ที่ ~0.42 เท่านั้น) — แก้ด้วยการเพิ่ม `domain` facet เข้า metadata (ดู [`plans/12-domain-facet.md`](plans/12-domain-facet.md)) ให้ pre-filter ตัด candidate pool ข้าม domain ได้ก่อนคำนวณ cosine เลย

| backend | recall ไม่ filter @ 1,945 | recall filter `domain=core` @ 1,945 | baseline @ 55 ไฟล์ |
|---|---|---|---|
| **vector** | 0.53 | **0.75** | 0.78 |
| ripgrep | 0.62–0.64 | **0.73** | 0.74 |
| fts5 | 0.67 | **0.75** | 0.72 (เกิน baseline) |
| router-route | 0.63–0.65 | **0.82** | ~0.845 |
| **router-fuse** | 0.79–0.81 | **0.93** | ~0.925 (เกิน baseline) |
| graph | 0.65 | **0.86** | 0.86 (เท่า baseline เป๊ะ) |

filter กู้ recall กลับมาใกล้เคียงหรือเกิน baseline 55 ไฟล์ทุกตัว — เพราะ candidate pool ที่ filter แล้วเหลือขนาดเท่ากับตอนวัด baseline จริงๆ (55 note) latency ก็ดีขึ้นตามไปด้วย (vector 3.46ms → **0.24ms**) **ข้อจำกัดที่ต้องรู้:** filter นี้ช่วยได้เฉพาะตอนที่ caller ระบุ `domain` ล่วงหน้าเท่านั้น — query ที่ไม่รู้ domain ยังเจอปัญหาเดิม รายละเอียดเต็มดู [`CHECKLIST.md`](CHECKLIST.md)

### 7.7 พบว่า recall/MRR ไม่ reproducible 100% ที่ scale ใหญ่ (finding ที่ยังไม่ได้แก้)

ระหว่างตรวจสอบว่า domain facet (7.6) ไม่ทำให้ query ที่ไม่ระบุ `domain` มีพฤติกรรมเปลี่ยนไป (regression check) รัน `npm run bench` **โค้ดเดียวกันเป๊ะ ไม่มีการแก้ไขใดๆ ระหว่างสองรอบ** ติดกัน 2 ครั้งที่ vault 1,945 ไฟล์ กลับได้ตัวเลขต่างกัน:

| backend | รอบ 1 | รอบ 2 | รอบ 3 |
|---|---|---|---|
| ripgrep recall@5 | 0.62 | 0.64 | — |
| ripgrep MRR | 0.59 | 0.57 | 0.59 |
| router-fuse recall@5 | 0.81 | 0.79 | 0.81 |
| router-route recall@5 | 0.65 | 0.63 | — |

**ขัดกับคำกล่าวที่หัวข้อ 6 ว่า "recall/precision/MRR reproducible 100%"** ซึ่งเป็นจริงตอนวัดที่ 55 ไฟล์ (ยืนยันมาตลอดตั้งแต่ Workshop 01) แต่ **ไม่ hold อีกต่อไปที่ scale 1,945 ไฟล์**

**สาเหตุที่เป็นไปได้มากที่สุด (ยังไม่ได้พิสูจน์):** content จำนวนมากที่ใกล้เคียงกันมากทางความหมาย/ตัวอักษร (จาก template เดียวกัน — ดู cosine similarity 0.77-0.89 ที่วัดไว้ใน 7.6) ทำให้เกิด **tie score บ่อยขึ้นมาก** เมื่อ candidate เยอะ และการตัด tie (sort ที่คะแนนเท่ากัน) ขึ้นกับลำดับที่ระบบไม่ได้รับประกันความคงที่ข้าม run — เช่น `ripgrep` spawn subprocess ที่อาจ parallelize การเดิน directory tree ทำให้ผลลัพธ์ที่คะแนนเท่ากันมาถึงคนละลำดับในแต่ละรอบ

**สถานะ:** เป็น finding ที่เก็บบันทึกไว้ตรงๆ ยังไม่ได้สืบสาเหตุลึกหรือแก้ไข — ถ้าจะแก้ต้องเพิ่ม deterministic tie-breaker (เช่น sort รองด้วย `note.id`) ให้ backend ที่มีปัญหา ไม่ใช่แค่ ripgrep แต่อาจรวมถึง fts5/vector ด้วยถ้ามี tie เกิดขึ้นจริงในนั้นเหมือนกัน — รายละเอียดตัวเลขดิบอยู่ที่ [`CHECKLIST.md`](CHECKLIST.md)

### สรุปหัวข้อ 7

**ความเร็วไม่ใช่ปัญหาที่ scale นี้** (55→1,945 ไฟล์) — แทบทุก backend ยังตอบสนองในหลักมิลลิวินาที **ความแม่นยำของ backend ดิบๆ ตกลงจริง โดยเฉพาะ vector** แต่**แก้ได้จริงด้วย domain facet** (7.6) ถ้ารู้ scope ล่วงหน้า — และถึงจะไม่ filter การใช้งานจริงผ่าน **AI agent ที่มี reasoning** ก็ช่วยกลบข้อจำกัดนี้ได้มากอยู่แล้ว (7.5) **ข้อค้นพบแถมที่สำคัญ:** ระบบไม่ reproducible 100% อีกต่อไปที่ scale ใหญ่ (7.7) — ต่างจากที่เคยยืนยันไว้ตอน 55 ไฟล์ ต้องระวังเวลาอ่านตัวเลข benchmark เดี่ยวๆ ที่ scale นี้ เพราะรันซ้ำอาจได้ค่าไม่เท่าเดิม
