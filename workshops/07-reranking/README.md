# Workshop 07 — Cross-encoder reranking (2-stage retrieval)

## คำถามตั้งต้น

- cross-encoder ต่างจาก bi-encoder (WS03) ยังไง **ในทางกลไก** ไม่ใช่แค่ "แม่นกว่า"
- reranking ช่วยได้จริงแค่ไหน
- แลกมากับ latency เท่าไหร่ และ candidate ควรเอามากี่ตัว

## ทฤษฎีสั้น

**bi-encoder (WS03):** encode query กับ document **แยกกัน** แล้ววัด cosine — document embed ล่วงหน้าได้ ตอน query จึงเหลือแค่ O(1) lookup แต่โมเดล**ไม่เคยเห็น query กับ document พร้อมกันเลย**

**cross-encoder:** ยัด `[query, document]` เข้าโมเดลพร้อมกันเป็นคู่ (text pair) → attention มองข้ามไปมาระหว่างคำใน query กับคำใน doc ได้เต็มที่ → แม่นกว่ามาก แต่**คำนวณล่วงหน้าไม่ได้เลย** ต้อง forward pass ใหม่ทุกคู่ตอน query ต้นทุนเป็น O(N) ต่อ query

**2-stage:** stage 1 (backend เดิม) คัด candidate กว้างๆ เน้น recall → stage 2 (cross-encoder) จัดอันดับ top-N นั้นใหม่เน้น precision

---

## W7-1 — พิสูจน์ headroom ก่อนเขียนโค้ด

คำนวณ **oracle ceiling**: ถ้าจัดอันดับ candidate top-10 ของแต่ละ backend ได้สมบูรณ์แบบ recall@5 จะได้เท่าไหร่ (25 query รวม `multi-hop` จาก WS06)

| backend | actual recall | oracle recall | gap | actual MRR | oracle MRR | gap |
|---|---|---|---|---|---|---|
| ripgrep | 0.733 | 0.773 | 0.040 | 0.743 | 0.840 | 0.097 |
| fts5 | 0.740 | 0.760 | 0.020 | 0.800 | 0.800 | **0.000** |
| **vector** | 0.753 | 0.827 | **0.073** | 0.796 | 0.960 | **0.164** |
| router-route | 0.820 | 0.847 | 0.027 | 0.819 | 0.920 | 0.101 |
| **router-fuse** | 0.933 | 0.933 | **0.000** | 0.920 | 0.960 | 0.040 |
| graph (WS06) | 0.860 | 0.893 | 0.033 | 0.810 | 0.920 | 0.110 |

**ข้อสรุปสำคัญที่สุด: `router-fuse` มี gap = 0.000 สำหรับ recall** — แปลว่า fuse จัดอันดับผลลัพธ์ที่มันเจอได้ดีที่สุดเท่าที่จะเป็นไปได้อยู่แล้ว **reranking ช่วยอะไรไม่ได้เลย** ถ้าจะใช้กับ fuse

**`vector` มี headroom มากที่สุด** (gap recall 0.073, gap MRR 0.164) — ผ่านเกณฑ์ 0.05 ที่ตั้งไว้ ไม่ต้องขยาย query set เพิ่ม แยกดู per-kind ของ vector:

| kind | actual | oracle | gap |
|---|---|---|---|
| exact | 0.47 | **0.70** | **0.23** |
| keyword | 1.00 | 1.00 | 0.00 |
| semantic | 0.67 | 0.67 | 0.00 |
| filtered | 1.00 | 1.00 | 0.00 |
| multi-hop | 0.63 | 0.77 | 0.13 |

**vector หา identifier ที่ถูกเจอได้ (อยู่ใน top-10 candidate pool จริง) แต่จัดอันดับผิด** — ตรงกับที่ WS03 พบว่า vector แพ้ `exact` recall แค่ 0.47 เพราะ embedding มองชื่อ env var เป็นแค่ "คำแปลกๆ" **นี่คือเป้าหมายที่ชัดเจนที่สุดของ workshop นี้**

**บทสรุปที่ต้องจำ:** reranking แก้ปัญหา**การเรียงลำดับ** ไม่ได้แก้ปัญหา**candidate ที่หาไม่เจอตั้งแต่แรก** — `fts5`/`semantic`/`keyword`/`filtered` ทุกที่ gap=0.00 เพราะ candidate ที่มีอยู่แล้วถูกจัดอันดับดีที่สุดแล้ว ไม่มีอะไรให้ rerank ปรับปรุง

---

## W7-2 — Spike: หาโมเดลที่รองรับไทย

`ms-marco-MiniLM` (ตัวยอดนิยม) เทรนบน MS MARCO **ภาษาอังกฤษล้วน** — ไม่เลือกใช้ตามที่ plan เตือนไว้

**เลือกใช้:** `jinaai/jina-reranker-v2-base-multilingual` (XLM-RoBERTa base, 12 layers, hidden 768, `num_labels=1`) — ขนาดบนดิสก์ (quantized q8) **283MB**

**เจอ abstraction ที่ไม่ทำงานตามโฆษณา (ธีมเดิมจาก WS03):** หน้าโมเดลติด tag `transformers.js` และมี `onnx/model.onnx` พร้อมใช้ แต่ `config.json` **ไม่มี field `model_type`** (ใช้ `auto_map` ชี้ python class แทน) ทำให้ `AutoModelForSequenceClassification.from_pretrained()` โยน `Unsupported model type: null` ทันที — ต้อง import class ตรงๆ (`XLMRobertaForSequenceClassification`) แทน `Auto*` เหมือนที่ WS03 ต้องเลี่ยง `pipeline()` เพราะ truncation ไม่ทำงานจริง

### ทดสอบคู่ตรงข้าม (relevant vs irrelevant) — 5 คู่ ไทย+อังกฤษปนกัน

| query | relevant score | irrelevant score | ผ่าน |
|---|---|---|---|
| "ลูกค้าขอคืนเงินแล้วระบบค้าง" | −0.394 | −2.401 | ✓ |
| "PAYMENT_GATEWAY_TIMEOUT_MS" | 2.153 | −2.857 | ✓ |
| "refund policy" | −0.512 | −2.412 | ✓ |
| "database migration แตะตารางใหญ่" | 1.284 | −3.071 | ✓ |
| "อยากไม่เอาของแล้วหลังจ่ายเงินไปแล้ว..." | −1.640 | −3.210 | ✓ |

**ผ่านทุกคู่ 5/5** — โมเดลแยกแยะ relevant/irrelevant ได้จริงทั้งภาษาไทยและอังกฤษ รวมถึง query แบบ identifier ตรงตัว

### Throughput (สั้น vs เอกสารจริง — ความต่างที่ไม่คาดคิด)

| ทดสอบ | เอกสารสั้น (spike) | เอกสารจริงจากวอลต์ (800 ตัวอักษร) |
|---|---|---|
| 10 คู่ | 140ms (14.0ms/คู่) | ~650–950ms (65–95ms/คู่) |
| 50 คู่ | 547ms (10.9ms/คู่) | (ประมาณ 5x จากด้านบน) |

**ต้นทุนต่อคู่ไม่คงที่ — ขึ้นกับความยาวเอกสารจริง ไม่ใช่แค่จำนวนคู่** cross-encoder ต้อง attention ข้ามทุก token ของทั้ง query และ document พร้อมกัน เอกสารยาวกว่า = token มากกว่า = compute มากกว่าแบบไม่เป็นเส้นตรง (ใกล้ quadratic) ตัวเลข throughput ที่วัดจากประโยคสั้นๆ **ไม่สะท้อนต้นทุนจริงของการ rerank เอกสารเต็ม** — บทเรียนสำคัญสำหรับใครจะเอาตัวเลข benchmark ของโมเดลไปอ้างอิงตรงๆ

---

## W7-3 — `rerank.backend.ts`

[`src/search/backends/rerank.backend.ts`](../../src/search/backends/rerank.backend.ts) ห่อ backend อื่นแบบเดียวกับ `RouterBackend`/`GraphBackend`

**แยก `stage1Ms` / `rerankMs` เสมอ** ผ่าน `getLastTiming()` — ไม่งั้นจะสรุปผิดว่าช้าเพราะ retrieve ทั้งที่ต้นทุนเกือบทั้งหมดมาจาก cross-encoder

**Diagnostic `getLastProvenance()`** บอกอันดับก่อน/หลัง rerank ของทุกผลลัพธ์ ตัวอย่างจริง (query `"PAYMENT_GATEWAY_TIMEOUT_MS"`, seed=vector):

```
deployment/connection-timeout-tuning.md   before=#10  after=#1   stage1=0.427  rerank=0.621
structure/module-payment-identifiers.md   before=#5   after=#2   stage1=0.456  rerank=0.437
business-logic/payment-retry-policy.md    before=#1   after=#3   stage1=0.548  rerank=0.050
```

`connection-timeout-tuning.md` เด้งจากอันดับ 10 (นอก top-5 เดิม) ขึ้นมาอันดับ 1 — และเป็นไฟล์ relevant จริงตาม ground truth

---

## W7-4 — วัด trade-off ของ topN

### rerank(vector) — topN = 5/10/20/50 (25 query, warmup 1 รอบ)

| config | recall@5 | precision@5 | MRR | stage1 (ms) | rerank (ms) | total (ms) |
|---|---|---|---|---|---|---|
| vector (ไม่ rerank) | 0.753 | — | — | — | — | — |
| topN=5 | 0.753 (**+0.000**) | 0.280 | 0.880 | 0.59 | 297 | 298 |
| topN=10 | **0.827** (+0.074) | 0.320 | 0.940 | 0.52 | 848 | 849 |
| topN=20 | 0.880 (+0.127) | 0.352 | 0.960 | 0.61 | 1,249 | 1,250 |
| topN=50 | **0.980** (+0.227) | 0.400 | 0.973 | 0.72 | 3,412 | 3,412 |

**topN=5 ไม่ได้อะไรเลย** ตรงตามทฤษฎี — candidate pool เท่ากับ top-5 ที่ประเมินอยู่แล้ว ไม่มีที่ให้ดึงเอกสารใหม่เข้ามา มีแต่จัดลำดับใหม่ในกลุ่มเดิม

**topN=10 = 0.827 ตรงกับ oracle ceiling ที่คำนวณไว้ใน W7-1 เป๊ะ** (0.827) — ยืนยันว่า cross-encoder จัดอันดับได้ดีเท่าที่ทฤษฎีบอกว่าเป็นไปได้สูงสุดแล้วที่ topN นี้ พิสูจน์ว่าวิธี oracle ceiling ที่ใช้ทำนายไว้แม่นจริง

**topN=50 ได้ recall สูงสุดถึง 0.980** — เกิน `router-fuse` (0.933) ด้วยซ้ำ แต่ต้นทุน **3.4 วินาทีต่อ query**

### เทียบกับ `router-fuse` ตรงๆ

| | recall@5 | latency |
|---|---|---|
| router-fuse | 0.933 | ~30ms |
| rerank(router-route, topN=20) | 0.887 (**แพ้**) | ~1,065ms (**35× ช้ากว่า**) |
| rerank(vector, topN=50) | **0.980** (ชนะ) | ~3,412ms (**114× ช้ากว่า**) |

**rerank(router-route) แพ้ fuse ทั้ง recall และ latency** — เพราะ router-route มี oracle gap แค่ 0.027 ตั้งแต่ต้น (เกือบไม่มีที่ให้ปรับปรุง) reranking จึงจ่ายต้นทุนเต็มๆ โดยได้ผลตอบแทนน้อย **rerank(vector) ชนะ fuse ได้จริงแต่ต้องจ่าย topN=50 ซึ่งแพงกว่า fuse ถึง 114 เท่า** — reranking คุ้มก็ต่อเมื่อใช้กับ backend ที่มี headroom มากพอ (vector) ไม่ใช่กับตัวที่ปรับแต่งมาดีอยู่แล้ว (router-route)

**เหตุผลที่ไม่ลงทะเบียน `rerank` เป็น backend ถาวรใน `npm run bench`:** ที่ topN=20 ขึ้นไป การรัน bench เต็มรูปแบบ (warmup 3 + วัด 20 รอบ × 25 query) จะใช้เวลาหลายสิบนาที ไม่คุ้มกับ CI/workflow ปกติ — เก็บเป็น backend ที่ทดสอบแล้วจริงแต่เรียกใช้แยกต่างหาก (แนวเดียวกับ LanceDB ANN ใน WS03)

---

## W7-5 — สรุป

**เคสที่ rerank ดันเอกสารถูกจากอันดับท้ายขึ้น top-3:** `q-exact-payment-timeout-const` — `connection-timeout-tuning.md` จาก #10 → #1 (ไม่เคยติด top-5 เดิม → กลายเป็นอันดับ 1)

**เคสที่ rerank ทำให้แย่ลง:** **ไม่พบเลยสักเคสเดียว** ทดสอบครบทั้ง 3 backend (ripgrep/fts5/vector) ที่ topN=5 (จุดที่เสี่ยงสุดเพราะ pool คงที่ มีแต่จัดลำดับใหม่) ทั้ง 25 query — recall/MRR ไม่เคยร่วงจาก baseline แม้แต่ query เดียว ตามที่ plan เตือนไว้ล่วงหน้า **นี่อาจแปลว่า query set นี้ยังไม่มีเคสกำกวมพอที่จะหลอกโมเดลได้** (ground truth ส่วนใหญ่ชัดเจนว่าเอกสารไหนเกี่ยวข้อง ไม่มี "ตัวลวง" ที่คล้ายกันมากจนโมเดลสับสน) ไม่ใช่ว่า reranking ไม่มีความเสี่ยงเลยในสถานการณ์ทั่วไป

### สรุปตรงๆ — คุ้มหรือไม่คุ้มที่ vault ขนาดนี้

**คุ้มเฉพาะกรณีเดียว:** ใช้ backend เดี่ยวที่มี headroom สูง (vector, oracle gap 0.073) ที่ topN พอเหมาะ (10 ให้ recall เท่า oracle ที่ 849ms/query — ยังพอรับได้สำหรับ use case ที่ไม่ real-time)

**ไม่คุ้มในทุกกรณีอื่น:** ใช้กับ backend ที่ tune มาดีแล้ว (router-route, fuse) เพราะ oracle gap เกือบเป็นศูนย์ — จ่ายต้นทุน O(N) เต็มๆ โดยได้ผลตอบแทนแทบไม่มี และ `router-fuse` ที่มีอยู่แล้วให้ recall 0.933 ที่ 30ms **เร็วกว่า rerank(vector, topN=50) ถึง 114 เท่า** โดยแม่นน้อยกว่าแค่ 0.047 — ไม่ใช่การแลกที่คุ้มสำหรับ user-facing search ส่วนใหญ่

**สรุปให้สั้นที่สุด:** reranking เป็นเครื่องมือแก้ปัญหาเฉพาะจุด (backend เดี่ยวที่มี ranking error สูง) ไม่ใช่ตัวยกระดับทั่วไปที่ควรใส่เข้าไปทุก pipeline — บนระบบที่มี hybrid router/fusion ดีอยู่แล้วแบบโปรเจกต์นี้ ผลตอบแทนของ rerank แทบไม่มีเหลือให้เก็บเกี่ยว
