# Workshop 03 — Vector search

## คำถามตั้งต้น

- เมื่อไหร่ semantic ชนะ keyword และเมื่อไหร่ที่มันแพ้ (สำคัญพอกัน)
- แลกมากับ cost/latency เท่าไหร่จริงๆ
- ANN ต่างจาก brute-force ยังไงที่ vault ขนาดนี้ — คุ้มไหม

## ทฤษฎีสั้น

Embedding = แปลงข้อความเป็นเวกเตอร์ที่ข้อความความหมายใกล้กันอยู่ใกล้กันในสเปซ → "คืนเงิน" กับ "refund" ใกล้กันได้ทั้งที่ไม่มีตัวอักษรร่วมกันเลย cosine similarity วัดมุมไม่ใช่ระยะ → ความยาวเอกสารไม่มีผลโดยตรง (ต่างจาก raw match count ใน WS01) ราคาที่จ่าย: ต้องเรียก model ตอน index **และตอน query ทุกครั้ง** — latency ก้อนใหญ่ย้ายมาอยู่ที่ query path ซึ่งต่างจาก FTS5 (WS02) โดยสิ้นเชิงที่ query แทบไม่มีต้นทุนเลย

---

## W3-1 — Embedding pipeline

**เครื่องที่วัด:** Node.js v26.2.0, Windows 11 Home (10.0.26200), Intel(R) Core(TM) Ultra 7 265 (CPU-only, ไม่มี GPU acceleration)

| | ค่า |
|---|---|
| Model | `Xenova/paraphrase-multilingual-MiniLM-L12-v2` (ONNX conversion ของ `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`) |
| Dimension | 384 |
| Max sequence length | **128 token** (มาจาก `sentence_bert_config.json` ของโมเดลต้นฉบับ — ดูรายละเอียดด้านล่าง) |
| ขนาดไฟล์ model บนดิสก์ | 465 MB (`onnx/model.onnx` 449MB + `tokenizer.json` 17MB) |
| เวลาโหลดครั้งแรก (ดาวน์โหลด) | ~110 วินาที |
| เวลาโหลดครั้งถัดไป (จาก cache) | ~1.3–1.4 วินาที |

`data/models/` เก็บไฟล์ model ที่ดาวน์โหลดมา — อยู่ใน `.gitignore` (ทั้งโฟลเดอร์ `data/` เป็น derived state ตาม CLAUDE.md §2.2) และ**ไม่นับเวลาโหลด model เป็น buildTimeMs** ของ backend ใดๆ — เป็น one-time setup แยกต่างหาก

### 128 token มาจากไหน — จุดที่ abstraction ซ่อนกลไกไว้ 2 ชั้น

`tokenizer_config.json` ของโมเดลบอก `model_max_length: 512` และ `config.json` บอก `max_position_embeddings: 512` — ถ้าเชื่อแค่นี้จะคิดว่า embed ได้ยาวถึง 512 token แต่ไฟล์ `sentence_bert_config.json` ของ repo ต้นฉบับ (`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`) ที่ transformers.js **ไม่ได้ดาวน์โหลดมาด้วย** ระบุ `max_seq_length: 128` — คือความยาวที่โมเดลถูกฝึกมาให้ใช้งานดีที่สุดจริงๆ

พิสูจน์ว่ามีผลจริง ไม่ใช่แค่ตัวเลขในเอกสาร: embed ข้อความยาวเดียวกัน (600+ token) ด้วย `max_length=128` เทียบกับ `max_length=512` ได้ cosine similarity แค่ **0.78** (ไม่ใช่ 1.0) — สอง embedding ของ "ข้อความเดียวกัน" ต่างกันจริง เพราะเห็นคนละส่วนของข้อความ

**เจออีกชั้นหนึ่ง:** `pipeline("feature-extraction", ...)` ของ `@huggingface/transformers` (ตัวช่วยสำเร็จรูป) **ไม่ forward `max_length`/`truncation` ที่ส่งเข้าไปให้ tokenizer ภายในเลย** — ทดสอบแล้วพบว่า embed ข้อความยาวเดียวกันได้ผลเหมือนกันทุกประการไม่ว่าจะส่ง `max_length` เท่าไหร่ (`similarity = 1.000000` เป๊ะ) เป็น abstraction ที่ซ่อนกลไกไว้จริงตามที่ CLAUDE.md §1 เตือน จึงเปลี่ยนมาเรียก `AutoTokenizer` + `AutoModel` ตรงๆ แล้วทำ mean-pooling และ L2-normalize เอง (ดู [`src/search/backends/embedder.ts`](../../src/search/backends/embedder.ts)) — เห็นทุกขั้นตอนชัดเจน และ truncation ทำงานจริงตามที่ตั้งใจ

### Throughput (CPU, batch)

| Batch size | เวลารวม | เฉลี่ยต่อชิ้น |
|---|---|---|
| 3 short texts | 8.6ms | 2.9ms |
| 100 chunks (~15 คำ/ชิ้น) | 132.6ms | 1.33ms |

**Single-query embed หลัง index() (batch=1):** เจอปรากฏการณ์ที่น่าสนใจ — **การ embed แบบ batch=1 ครั้งแรกหลัง index() เสร็จ (ซึ่งใช้ batch ใหญ่) ใช้เวลา ~1250ms** (ทำซ้ำได้เสมอ 10 รอบ) เพราะ ONNX runtime compile execution graph แยกตาม input shape — shape ใหม่ (batch=1) ที่ไม่เคยเห็นมาก่อนต้อง compile ใหม่ ครั้งถัดๆ ไปเหลือแค่ ~7–16ms การ warmup 3 รอบใน `bench.ts` ดูดซับต้นทุนนี้ไปแล้วก่อนวัด p50/p95 จริง แต่เป็นต้นทุนที่ต้องรู้ไว้ถ้าจะ deploy ระบบจริง (เช่น warm-up request แรกหลัง deploy)

### ทดสอบว่าข้อความไทยได้เวกเตอร์สมเหตุสมผล

```
cos("คืนเงิน", "refund") = 0.7654
cos("คืนเงิน", "deploy") = 0.1433
```

ผ่านเงื่อนไข (refund > deploy) ชัดเจน — โมเดล multilingual จับความหมายข้ามภาษาได้จริง

---

## W3-2 — Chunking

Chunk ตามหัวข้อ markdown ระดับ `##` (โค้ดที่ [`src/search/backends/chunking.ts`](../../src/search/backends/chunking.ts)) — เนื้อหาก่อนหัวข้อ `##` แรก (คำนำใต้ H1) เป็น chunk แรกเสมอ ทุก chunk แนบ metadata prefix (`layer: ... | tags: ... | หัวข้อ: H1 > H2`) เพื่อไม่ให้ chunk ที่ตัดกลางเรื่องขาด context

### ตัวเลขจริง

| | ค่า |
|---|---|
| จำนวน chunk ทั้งหมด (55 notes) | 228 |
| chunk/note | min=3, median=4, max=14 |
| metadata prefix กินพื้นที่เฉลี่ย | **26.7%** ของความยาว chunk (นับตัวอักษร) |

metadata กินเกือบ 1 ใน 3 ของโควตา 128 token ต่อ chunk — ราคาที่ต้องจ่ายเพื่อไม่ให้ chunk ขาด context แต่ก็หมายความว่าเนื้อหาจริงที่ embed ได้เหลือแค่ ~73% ของ 128 token เท่านั้น

### whole-note vs chunked (query set เดียวกัน, 20 queries)

| | recall@5 | precision@5 | MRR |
|---|---|---|---|
| whole-note (baseline, ตัดที่ 128 token ทั้งไฟล์) | 0.725 | 0.240 | 0.735 |
| **chunked** | **0.783** | **0.260** | **0.788** |

Chunking ชนะทุก metric แต่ **ไม่ได้ต่างมหาศาลอย่างที่คาด** — เหตุผลที่เป็นไปได้: query set ของเราไม่มี query ที่ต้องพึ่งเนื้อหากลางๆ ท้ายๆ ไฟล์ยาวโดยเฉพาะ (ground truth ส่วนใหญ่คือ note สั้น/กลาง) ผลต่างที่แท้จริงน่าจะเห็นชัดกว่านี้ถ้า query targeting เนื้อหาลึกใน note ยาว 2000+ คำมากกว่านี้

### Score aggregation: max vs mean — ตัดสินจากตัวเลข

| | recall@5 | precision@5 | MRR |
|---|---|---|---|
| **max** (เลือกใช้จริง) | **0.783** | **0.260** | 0.788 |
| mean | 0.683 | 0.220 | 0.806 |

**เลือก max** เพราะ recall/precision ดีกว่าชัดเจน — เหตุผลเชิงกลไก: mean ลดทอนคะแนนของ note ที่มีหลาย section (median 4 chunk/note) ลงไปเจือจางกับ chunk ที่ไม่เกี่ยวกับ query เลย ทั้งที่ note นั้นมี section หนึ่งที่ตรงประเด็นมาก — user ที่ค้นหาต้องการรู้ว่า "note นี้มีคำตอบไหม" ไม่ใช่ "note นี้เกี่ยวกับ query โดยเฉลี่ยแค่ไหน" mean ได้ MRR สูงกว่าเล็กน้อย (0.806 vs 0.788) แต่ trade-off นี้ไม่คุ้มกับ recall ที่เสียไป 10 percentage point

---

## W3-3 — Embedding cache

Cache อยู่ที่ `data/embeddings.sqlite` (โค้ดที่ [`src/search/backends/embedding-cache.ts`](../../src/search/backends/embedding-cache.ts)) key = `sha256(model + ":" + chunkText)`

### ทดสอบทั้ง 4 เงื่อนไขจาก DoD (รันจริง)

| เงื่อนไข | ผล |
|---|---|
| Cold cache — embed ทั้ง vault ครั้งแรก (228 chunks) | **4,543ms** |
| Reindex ซ้ำ ไม่แก้อะไรเลย | `hits=228 misses=0 embedMs=0.00` — ไม่เรียก model เลยสักครั้ง |
| แก้ 1 note แล้ว reindex | `hits=227 misses=1` — เฉพาะ chunk ของ note ที่แก้เท่านั้นที่ miss |
| เปลี่ยน model name (พิสูจน์ key ถูก) | `hits=0 misses=5` — miss ทั้งหมดทันที ไม่มี false hit ข้าม model |

Cache ทำให้ reindex ที่ไม่มีอะไรเปลี่ยนเร็วขึ้นจาก **4,543ms → เกือบ 0ms** (เหลือแค่ overhead อ่าน vault + SQLite lookup) — นี่คือสิ่งที่พิสูจน์ว่าต้นทุน embedding เป็น one-time ต่อ content ไม่ใช่ต่อ reindex เหมือนที่ตั้งใจโชว์

---

## W3-4 — `vector.backend.ts` (brute-force)

Cosine similarity เขียนเอง ([`src/search/backends/vector.backend.ts`](../../src/search/backends/vector.backend.ts)):

```ts
// เวกเตอร์ทั้งสองฝั่ง normalize มาแล้ว (norm = 1) จาก embedder.ts
// cosine(a, b) = (a·b) / (|a||b|) = (a·b) / (1×1) = a·b ตรงๆ
function cosineSim(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}
```

ยืนยัน normalize แล้วจริง: `norm ของเวกเตอร์ = 1.000000` (วัดตรงๆ หลัง embed)

**Filter เป็น pre-filter ได้จริง** เพราะ metadata (layer, tags) อยู่ใน `notesById` ในหน่วยความจำอยู่แล้ว — กรอง chunk ที่ไม่ผ่านเงื่อนไขออกก่อนคำนวณ cosine เลย ไม่ต้องคำนวณแล้วค่อยทิ้งทีหลังแบบ WS01

**แยก `embedQueryMs` / `searchMs` เสมอ** (ผ่าน `getLastSearchTiming()`) — ถ้ารวมกันจะสรุปผิดว่า vector search ช้า ทั้งที่ในทางปฏิบัติ (bench ที่ warmup แล้ว) `searchMs` (brute-force scan 228 เวกเตอร์) อยู่ที่เศษเสี้ยว ms เท่านั้น ความช้าที่แท้จริงมาจาก `embedQueryMs` ล้วนๆ โดยเฉพาะ query แรกหลัง index (~1250ms ตามที่เจอใน W3-1)

`matchedBy: "vector"` ทุกผลลัพธ์

---

## W3-5 — ANN (LanceDB) + scaling study

corpus สังเคราะห์สร้างแบบ**มีคลัสเตอร์** ไม่ใช่สุ่ม uniform — ถ้าสุ่ม uniform ในสเปซ 384 มิติ จุดทุกจุดจะห่างจากกันเกือบเท่ากันหมด (curse of dimensionality) ทำให้ ANN partition ไม่มีความหมายและวัดผลผิดเพี้ยนจากการกระจายตัวของ embedding จริง (ซึ่งเป็นก้อนๆ ตามหัวข้อ ไม่ใช่กระจายสม่ำเสมอ) วิธีสร้าง: สุ่ม centroid (unit vector) จำนวน `√n` ตัว แล้วสร้างจุดรอบแต่ละ centroid ด้วย Gaussian noise (scale=0.15) แล้ว normalize กลับเป็น unit vector

### ตารางผลวัดจริง (brute-force ของเราเองเป็น ground truth)

| corpus size | brute-force p50 | LanceDB ANN p50 (default IVF_PQ) | ANN recall@10 |
|---|---|---|---|
| 50 (vault จริง) | 0.02ms | 1.22ms (ไม่มี index — ต่ำกว่า 256 แถวขั้นต่ำของ IVF_PQ) | 1.00 |
| 10,000 | 4.64ms | 2.23ms | **0.33** |
| 50,000 | 23.29ms | 3.47ms | **0.18** |
| 100,000 | 50.70ms | 4.18ms | **0.20** |

**จุดตัดที่ ANN เริ่มเร็วกว่า brute-force: ระหว่าง 50 – 10,000** (ที่ 50 แถว LanceDB ยังไม่ build index เลยด้วยซ้ำเพราะไม่ถึงเกณฑ์ขั้นต่ำ ที่ 10k ANN (2.23ms) เร็วกว่า brute-force (4.64ms) แล้ว 2 เท่า และช่องว่างยิ่งถ่างที่ 100k (4.18ms vs 50.70ms — เร็วกว่า 12 เท่า)

**แต่ recall ต่ำมากจนใช้งานจริงไม่ได้** — นี่คือสิ่งที่ต้องขุดหาสาเหตุ ไม่ใช่แค่รายงานตัวเลขเฉยๆ

### ขุดหาสาเหตุ: param ที่ LanceDB ซ่อนไว้และผลจากการปรับ

`createIndex()` ไม่ระบุ config = ใช้ `Index.ivfPq()` เป็น default เสมอ — **PQ (product quantization) คือการบีบอัดเวกเตอร์แบบ lossy** เพื่อประหยัด memory/storage ที่ scale ใหญ่มากๆ (ล้าน–พันล้านเวกเตอร์) โดยไม่บอกผู้ใช้ตรงๆ ว่ากำลังแลก recall กับพื้นที่อยู่

ทดลองปรับ param ที่ n=10,000 (ground truth เดียวกัน):

| Config | recall@10 | latency |
|---|---|---|
| default (IVF_PQ) | 0.33 (2/10 ในการทดสอบเดี่ยว) | 4.60ms |
| `nprobes=20` (ค้นหลาย partition ขึ้น) | 0.33 (2/10) — **ไม่ต่างจาก default เลย** | 2.15ms |
| `nprobes=50` | 0.33 (2/10) — **ยังไม่ต่าง** | 2.20ms |
| `refineFactor=10` (re-rank ด้วยเวกเตอร์จริงหลัง ANN คัดมาก่อน) | 0.71 (7/10) | 4.26ms |
| `nprobes=20` + `refineFactor=10` | 0.71 (7/10) | 4.02ms |

**`nprobes` แทบไม่ช่วยเลย แต่ `refineFactor` ช่วยมาก** — สรุปได้ว่าปัญหา**ไม่ใช่**การค้นไม่ครบ partition (coverage) แต่คือ**ความคลาดเคลื่อนจาก PQ compression เอง** (การประมาณระยะทางด้วยเวกเตอร์ที่ถูกบีบอัดแล้วผิดเพี้ยนจนจัดอันดับผิด) `refineFactor` ช่วยเพราะมันไปดึงเวกเตอร์ตัวเต็มกลับมาคำนวณระยะทางจริงอีกทีสำหรับผู้เข้าแข่งขันที่ ANN คัดมาแล้วเท่านั้น — ถ้า partition ที่ถูกค้นไม่มีตัวจริงอยู่เลยตั้งแต่แรก `refineFactor` ก็ช่วยไม่ได้

**พิสูจน์เด็ดขาด — ลอง `Index.ivfFlat()` (IVF เหมือนกัน แต่ไม่มี PQ compression):**

| Config | n | recall@10 | latency |
|---|---|---|---|
| IVF_PQ (default) | 10,000 | 0.33 | 2.23ms |
| **IVF_FLAT (ไม่มี PQ)** | 10,000 | **1.00** | ~4ms |
| **IVF_FLAT (ไม่มี PQ)** | 100,000 | **0.98** | 11.77ms (brute-force เดิม 48.13ms — เร็วกว่า 4 เท่า) |

**สรุปเด็ดขาด: recall ที่หายไปทั้งหมดมาจาก PQ compression ล้วนๆ** ไม่ใช่ข้อจำกัดของแนวคิด ANN/IVF เอง `IVF_FLAT` ให้ recall เกือบสมบูรณ์แบบ (0.98–1.00) พร้อมความเร็วที่ยังเหนือกว่า brute-force หลายเท่าที่ scale ใหญ่ — **การเรียก `createIndex()` เปล่าๆ โดยไม่รู้ว่า default คือ PQ คือกับดักที่ทำให้คนคิดว่า "ANN แม่นน้อยกว่า brute-force โดยธรรมชาติ" ทั้งที่จริงๆ แล้วเป็นแค่ default ที่เลือกมาไม่เหมาะกับ scale/ความต้องการ recall ของงานนี้**

### สรุปสำหรับ vault ขนาดจริง (55 notes → 228 chunks)

**ยังไม่ถึงจุดที่ต้องใช้ ANN เลย** — ที่ขนาดนี้ LanceDB เองยังไม่ build index ให้ด้วยซ้ำ (ต่ำกว่าเกณฑ์ขั้นต่ำของ IVF_PQ) brute-force เร็วกว่า (0.02ms) ทุกทาง และแม่นยำ 100% เสมอ (ไม่มี approximation ให้ผิดพลาด) จุดตัดที่ ANN เริ่มคุ้มอยู่ที่หลักหมื่นเวกเตอร์ขึ้นไป — ไกลจากขนาด production ปัจจุบันมาก และนี่คือข้อสรุปที่มีค่าในตัวเอง: **การเพิ่มความซับซ้อนของ ANN ตอนนี้จะเป็นการแลกความแม่นยำ (ถ้าใช้ default ผิด) กับความเร็วที่ยังไม่จำเป็นต้องใช้เลย**

---

## W3-6 — วัดผล + สรุป

**เครื่องที่วัด:** Node.js v26.2.0, Windows 11 Home (10.0.26200), Intel(R) Core(TM) Ultra 7 265 — 2026-08-22

### ตารางเทียบ 3 backend

| backend | p50 (ms) | p95 (ms) | recall@5 | precision@5 | MRR | indexed | size (bytes) | build (ms) |
|---|---|---|---|---|---|---|---|---|
| ripgrep | 29.38 | 34.44 | 0.74 | 0.27 | 0.71 | 55 | 0 | 0.00 |
| fts5 | 0.06 | 0.15 | 0.72 | 0.25 | 0.75 | 55 | 671,744 | 2.78 |
| **vector** | 0.13 | 0.19 | **0.78** | 0.26 | **0.79** | 55 | 350,208 | 13.46 (คิดจาก cache — cold cache ~4,543ms ดู W3-3) |

vector มี recall/MRR รวมสูงสุดในสามตัว และเร็วกว่า ripgrep ~226 เท่า (ช้ากว่า fts5 เล็กน้อยเพราะยังต้อง embed query ทุกครั้ง)

### เคสที่ vector ชนะชัดเจน — query kind `semantic`

| backend | recall@5 (semantic) |
|---|---|
| ripgrep (WS01) | 0.07 |
| fts5 (WS02) | 0.07 |
| **vector** | **0.67** |

เคสจริงจาก vault (คู่ "คืนเงิน"/"refund" ที่ P0-5 ตั้งใจปลูกไว้):

- `q-semantic-refund-timeout`: query `"ลูกค้าขอคืนเงินแล้วระบบค้าง"` → vector เจอ `support-cases/case-3401.md` เป็นอันดับ 1 (score 0.651) — ripgrep/fts5 ไม่เจอเลยเพราะไม่มีคำว่า "ค้าง" ตรงตัวในไฟล์นั้นในรูปแบบที่ token match ได้
- `q-semantic-price-includes-vat`: query `"ราคาที่เห็นหน้าเว็บรวมภาษีหรือยัง"` → vector เจอ `business-logic/tax-calculation.md` เป็นอันดับ 1 (score 0.601) ทั้งที่ query ไม่มีคำว่า "VAT" หรือ "ภาษี" ตรงกับหัวข้อไฟล์แบบตัวต่อตัว

**vector ชนะเพราะเข้าใจว่า "ระบบค้าง" ↔ "stuck/timeout" และ "รวมภาษี" ↔ "VAT inclusive pricing" คือเรื่องเดียวกัน** — เป็นสิ่งที่ literal matching (WS01, WS02) ทำไม่ได้ไม่ว่าจะ tune สูตรยังไงก็ตาม

### เคสที่ vector แพ้ชัดเจน — query kind `exact`

| backend | recall@5 (exact) |
|---|---|
| ripgrep (WS01) | 1.00 |
| fts5 (WS02) | 1.00 |
| **vector** | **0.47** |

เคสจริง:

- `q-exact-payment-timeout-const`: query `"PAYMENT_GATEWAY_TIMEOUT_MS"` → vector ได้ top1 เป็น `business-logic/payment-retry-policy.md` (**ไม่ใช่ไฟล์ที่มี env var นี้จริง**) recall = 0.00 ทั้งที่ ripgrep/fts5 หาเจอ 100% เพราะเป็น literal substring
- `q-exact-refund-already-processed`: query `"REFUND_ALREADY_PROCESSED"` → vector หาเจอแค่ 1/3 ของไฟล์ที่ควรเจอ (recall 0.33)

**นี่คือเหตุผลทั้งหมดของ WS04:** embedding เข้าใจ "ความหมายรวม" ของประโยค ไม่ใช่ "ตัวอักษรที่ตรงกันเป๊ะ" — ชื่อ env var/function name เป็น token ที่ไม่มีความหมายทางภาษาธรรมชาติ โมเดลจึงมองเป็นแค่ "คำแปลกๆ" ที่ไม่ช่วยแยกแยะ ทำให้คะแนน cosine ของทุกไฟล์ใกล้เคียงกันหมดจนสุ่มๆ ว่าไฟล์ไหนจะติด top-k — ตรงข้ามกับ keyword matching ที่ literal string แบบนี้คือจุดแข็งที่สุด

### ต้นทุนรวม

| | ripgrep | fts5 | vector |
|---|---|---|---|
| buildTime (warm/cache) | 0 (ไม่มี index) | 2.78ms | 13.46ms |
| buildTime (cold, จากศูนย์) | 0 | ~17–29ms | ~4,543ms (ต้อง embed 228 chunk จริง) |
| ขนาด index | 0 | 671,744 bytes | 350,208 bytes |
| latency/query (warm) | 29.38ms | 0.06ms | 0.13ms (search) + query embed แปรผัน (0.2–16ms warm, ~1,250ms คำถามแรกหลัง index) |

vector ใช้พื้นที่**น้อยกว่า** FTS5 (350KB vs 672KB) เพราะเก็บแค่เวกเตอร์ 384 มิติ ไม่เก็บ inverted index + เนื้อหาซ้ำ แต่ต้นทุนที่แพงที่สุดคือ **เวลา** — ทั้งตอน build (cold cache นาทีนึงสำหรับ vault เล็กๆ) และตอน query แรกหลัง deploy (~1.25 วินาที)

---

## สรุป

**ไม่มี backend ไหนชนะทุกด้าน** — ripgrep ไม่มีต้นทุน setup เลยแต่ช้าและพลาด semantic เกือบหมด, FTS5 เร็วที่สุดและถูกที่สุดแต่ก็พลาด semantic เหมือนกัน, vector เข้าใจความหมายได้จริง (semantic recall 0.07→0.67) แต่แพ้ literal matching ขาดลอย (exact recall 1.00→0.47) และมีต้นทุนแฝง (query embed ตัวแรกช้า, cold cache index ช้ามาก)

ANN (LanceDB) ที่ vault ขนาดนี้**ไม่คุ้มใช้เลย** — brute-force เร็วกว่าและแม่นยำ 100% เสมอ จุดตัดอยู่ที่หลักหมื่นเวกเตอร์ขึ้นไป และแม้จะถึงจุดนั้นก็ต้องระวัง default `IVF_PQ` ที่แลก recall ไปกับพื้นที่โดยไม่บอกตรงๆ (`IVF_FLAT` คือทางแก้ถ้าต้องการความแม่นยำสูงพร้อม ANN speed)

### คำถามที่ WS04 (Hybrid router) ต้องตอบ

1. ถ้าแต่ละ backend ชนะคนละจุด — จะ **route query ไปยัง backend ที่เหมาะที่สุด** ได้ยังไงแบบ deterministic (ไม่ใช้ LLM ตัดสิน ตาม CLAUDE.md §2.1)?
2. Layer pre-filter (ที่ทั้ง 3 backend ทำได้ในระดับต่างกัน — post-filter ของ ripgrep, SQL WHERE ของ fts5, in-memory filter ของ vector) ช่วยตรงไหนเมื่อรวมหลาย backend เข้าด้วยกัน?
3. Fusion (RRF) รวมผลจากหลาย backend ที่ scoring คนละสเปซกัน (bm25 ติดลบ, cosine 0–1, ripgrep score นับจำนวน) ได้ยังไงโดยไม่ต้อง normalize คะแนนแบบเดา?
4. ความซับซ้อนของ router ที่เพิ่มขึ้น (ต้องรู้จัก 3 backend, ต้อง merge ผล) คุ้มกับที่ได้ recall รวมดีขึ้นแค่ไหน — ต้องมีตัวเลขเทียบ ไม่ใช่เชื่อว่า "รวมกันต้องดีกว่า" เฉยๆ
