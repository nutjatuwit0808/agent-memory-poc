# memory-workshop

Case study สำหรับเรียนรู้กลไกการจัดการ memory ของ agent ด้วยการ**เขียนเองทุกบรรทัด** (ไม่ใช้ framework สำเร็จรูปอย่าง Cognee/LangChain memory) — เปรียบเทียบ search backend 3 แบบ (ripgrep, SQLite FTS5, vector embedding) บน vault ข้อมูลชุดเดียวกัน ด้วย**ตัวเลขที่วัดจริง** ไม่ใช่ทฤษฎี

รายละเอียดเป้าหมาย/หลักการออกแบบ/กติกาทั้งหมด: [`CLAUDE.md`](CLAUDE.md) · สถานะงานแบบละเอียด: [`CHECKLIST.md`](CHECKLIST.md) · แผนงานแต่ละ phase: [`plans/`](plans/README.md)

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
