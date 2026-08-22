# Workshop 04 — Hybrid router

## คำถามตั้งต้น

- ทำไม production ไม่เลือก backend ตัวเดียว
- layer pre-filter ช่วยตรงไหน วัดเป็นตัวเลขได้เท่าไหร่
- routing ที่ deterministic ทำได้แค่ไหนโดยไม่ต้องใช้ LLM

## ทฤษฎีสั้น

จาก WS01–03 ไม่มี backend ไหนชนะทุก query kind: ripgrep ชนะ `exact` (recall 1.00) แต่แพ้ `semantic` (0.07), fts5 เร็วที่สุดแต่ก็แพ้ `semantic` เท่ากัน (0.07), vector ชนะ `semantic` (0.67) แต่แพ้ `exact` (0.47) — router คือการยอมรับข้อเท็จจริงนี้แล้วเลือกเครื่องมือตามรูปร่างของ query สองกลยุทธ์: **route** (เลือกตัวเดียวจากกฎ deterministic) กับ **fuse** (ยิงทุกตัวแล้วรวมอันดับด้วย RRF) — คนละ trade-off คนละราคา

---

## W4-1 — Query classifier

กฎอยู่ใน [`src/search/router.ts`](../../src/search/router.ts) เป็น array ของ `ClassificationRule` (ไม่ใช่ if-else ซ้อน) เดินตามลำดับจนเจอกฎแรกที่ match — **ไม่มี LLM call ที่ไหนเลย** ทุกกฎเป็น regex/นับคำล้วนๆ

| กฎ | เงื่อนไข | ไป backend | อ้างอิงตัวเลขจาก workshop ก่อน |
|---|---|---|---|
| `identifier-like` | ครอบ `"..."` / `SCREAMING_SNAKE_CASE` / มี `_` `-` `.` แบบ identifier | ripgrep | WS01 `q-exact-*` recall@5=1.00, vector (WS03) เหลือ 0.47 |
| `short-keyword` | ≤3 คำ | fts5 | WS02 keyword recall@5=1.00, p50=0.06ms เร็วสุด |
| `long-semantic` (fallback) | ≥4 คำ/ประโยค | vector | WS03 semantic recall@5=0.67 vs ripgrep/fts5 ที่ 0.07 เท่ากัน |

### บั๊กที่เจอระหว่างเขียน — ปัญหาเดิมโผล่ครั้งที่ 3

กฎ `short-keyword`/`long-semantic` เดิมนับคำด้วย `text.split(/\s+/)` — ใช้ได้กับ query ภาษาอังกฤษ แต่ **ภาษาไทยไม่มีช่องว่างคั่นคำ** ทำให้ query อย่าง `"ลูกค้าขอคืนเงินแล้วระบบค้าง"` (ประโยคเต็ม) ถูกนับเป็น **1 คำ** แล้ว route ไป fts5 ผิดทาง (ควรไป vector) ยูนิตเทสต์จับได้ทันที (`long-semantic: >=4 คำ/ประโยคคำถาม -> vector` fail) — นี่เป็นปัญหาเดียวกับที่เจอใน `vault-reader.ts` (P0) และ FTS5 tokenizer (WS02) **เกิดซ้ำเป็นครั้งที่ 3** แก้ด้วย heuristic เดียวกัน (นับ run อักษรไทยแยก ÷4 ตัวอักษร/คำ) คัดลอกมาไว้ใน `router.ts` เอง (ไม่ import จาก `core/` เพราะต้อง freeze แล้ว)

### routedBy — log ทุกครั้ง

`RouterBackend.search()` คืน `SearchResult[]` ตาม interface เดิม (แก้ signature ไม่ได้) แต่มี method เสริม `getLastRouting()` (นอก interface เหมือน `checkStale()` ของ WS02 และ `getLastSearchTiming()` ของ WS03) ให้ตรวจสอบได้เสมอว่าเข้ากฎไหน:

```
"PAYMENT_GATEWAY_TIMEOUT_MS" (kind=exact) -> rule="identifier-like" backend=ripgrep
"REFUND_SERVICE_URL"         (kind=exact) -> rule="identifier-like" backend=ripgrep
"processRefund"               (kind=exact) -> rule="short-keyword"  backend=fts5
"MAX_RETRY_ATTEMPTS"          (kind=exact) -> rule="identifier-like" backend=ripgrep
"REFUND_ALREADY_PROCESSED"    (kind=exact) -> rule="identifier-like" backend=ripgrep
```

(`processRefund` ไม่เข้ากฎ `identifier-like` เพราะ camelCase ไม่มี `_`/`-`/`.` — ไปตกที่ `short-keyword` แทน เป็นพฤติกรรมที่ตั้งใจ ไม่ใช่บั๊ก แต่เป็นตัวอย่างที่ดีว่ากฎ deterministic ก็ยังมีขอบที่ต้องคิดตาม)

**Unit test:** [`src/search/router.test.ts`](../../src/search/router.test.ts) ครอบทุกกฎ + RRF (11 test, รันด้วย `npm run test` ผ่าน Node built-in test runner ไม่ต้องเพิ่ม dependency)

---

## W4-2 — Layer pre-filter

วัด 2 แบบแยกกัน เพราะกลไก "pre-filter" มีความหมายต่างกันจริงในแต่ละ backend:

### แบบที่ 1: query.layer ที่ backend รับไปกรองเอง (ของเดิมจาก WS01–03)

| backend | ไม่มี filter p50 | มี filter p50 | Δ |
|---|---|---|---|
| ripgrep (post-filter, WS01) | 29.23ms | 30.90ms | +5.7% (noise — post-filter ไม่ลดงานจริง) |
| fts5 (SQL WHERE, WS02) | 0.062ms | 0.056ms | -9.4% |
| vector (in-memory filter, WS03) | 0.175ms | 0.082ms | **-53.2%** |

### แบบที่ 2: router pre-filter ที่แท้จริงสำหรับ ripgrep — จำกัดไดเรกทอรีที่สแกน

ripgrep ไม่ได้ประโยชน์จาก `query.layer` เพราะ implementation เดิมสแกนทั้ง `vault/` เสมอ (W1-4 ตั้งใจออกแบบเป็น post-filter) แต่ router **มีข้อมูลพอที่จะสั่ง scoped-search จริง** ได้ (ชี้ `vaultRoot` ไปที่ `vault/business-logic/` ตรงๆ แทน `vault/`):

| | p50 |
|---|---|
| scan ทั้ง vault (55 ไฟล์) แล้ว post-filter | 29.66ms |
| scan เฉพาะ `business-logic/` (15 ไฟล์) ตรงๆ | 28.17ms |
| ต่าง | 1.49ms (5.0%) |

### ทำไมประหยัดไม่เท่ากัน

- **ripgrep** ประหยัดได้จริงถ้า scope ไดเรกทอรี (ลดไฟล์ที่ต้องอ่านจริง) แต่ที่ vault ขนาดนี้ (55 ไฟล์) subprocess spawn overhead (~29ms) ครอบงำต้นทุนสแกนจนแทบไม่เห็นผล — ตามที่ WS01 README พิสูจน์ไว้แล้วว่าการสแกนจริงเริ่มมีนัยสำคัญตั้งแต่หลักพันไฟล์ขึ้นไป ที่ scale นั้น pre-filter แบบนี้จะเห็นผลชัดกว่านี้มาก
- **fts5** ประหยัดน้อย (ติดลบเล็กน้อย/noise) เพราะ SQL `WHERE n.layer = ?` มีประสิทธิภาพสูงอยู่แล้วตั้งแต่ WS02 — ต้นทุนของการกรองแทบไม่ต่างจากไม่กรองเลยที่ scale นี้
- **vector** ประหยัดชัดเจนที่สุด (-53%) เพราะ pre-filter ลดจำนวน chunk ที่ต้องคำนวณ cosine โดยตรง — แต่ **ยังต้อง embed query อยู่ดี** (embedQueryMs คงที่ไม่ลดตาม filter) ทำให้ประหยัด "ปานกลาง" ไม่ใช่ทั้งหมด ตามที่คาดไว้

**Recall ไม่ตกเมื่อ layer ถูกต้อง** — ทดสอบแล้วทั้ง 3 backend คืนผลลัพธ์ที่ `layer === "business-logic"` ทุกตัว 100% เมื่อระบุ filter

---

## W4-3 — Fusion (RRF)

```ts
// score = Σ 1/(k + rank), k=60
```

### ตัวอย่างคำนวณทีละขั้น — query จริง `"refund timeout"`

| Rank | ripgrep | fts5 | vector |
|---|---|---|---|
| 1 | refund-timeout-policy.md | connection-timeout-tuning.md | case-3401.md |
| 2 | connection-timeout-tuning.md | refund-timeout-policy.md | payment-retry-policy.md |
| 3 | long-form-order-state-machine.md | scaling-policy.md | refund-timeout-policy.md |
| 4 | module-refund.md | module-payment.md | refund-policy.md |
| 5 | refund-policy.md | env-variables-reference.md | case-2891.md |

คำนวณ `refund-timeout-policy.md` (ติด rank 1 ripgrep, rank 2 fts5, rank 3 vector):

```
score = 1/(60+1) + 1/(60+2) + 1/(60+3)
      = 0.016393 + 0.016129 + 0.015873
      = 0.048395  ✓ (ตรงกับที่โค้ดคำนวณจริง: 0.04840)
```

คำนวณ `connection-timeout-tuning.md` (rank 2 ripgrep, rank 1 fts5, ไม่ติด top5 vector):

```
score = 1/(60+2) + 1/(60+1) = 0.016129 + 0.016393 = 0.032522  ✓ (0.03252)
```

**ผลลัพธ์ fused top5:** `refund-timeout-policy.md` (0.04840) > `connection-timeout-tuning.md` (0.03252) > `refund-policy.md` (0.03101) > `case-3401.md` (0.01639) > `payment-retry-policy.md` (0.01613) — item ที่ติด top-5 ของ**หลาย** backend ลอยขึ้นมาอันดับต้นอัตโนมัติ แม้จะไม่ใช่อันดับ 1 ในตัวไหนเลยก็ตาม

### Latency: fuse แพงกว่า route กี่เท่า

| mode | p50 |
|---|---|
| route | 0.14–0.20ms |
| fuse | 29.11–30.22ms |
| **อัตราส่วน** | **~209 เท่า** |

fuse ต้องรอ backend ที่ช้าที่สุดเสมอ (ripgrep, subprocess spawn ~29ms) เพราะยิงพร้อมกันทุกตัวแล้วรอครบ — route หลีกเลี่ยงต้นทุนนี้ได้เกือบทั้งหมดเพราะส่วนใหญ่ query จะไม่ถูก route ไป ripgrep (ดู W4-4 ด้านล่าง: p50 ของ route ยังต่ำมาก แต่ p95 พุ่งขึ้นไปเกือบเท่า fuse เพราะ query ที่ถูก route ไป ripgrep จริงๆ ก็ยังช้าเท่าเดิม)

---

## W4-4 — Bench รวม + ตารางสรุปสุดท้าย

**เครื่องที่วัด:** Node.js v26.2.0, Windows 11 Home (10.0.26200), Intel(R) Core(TM) Ultra 7 265 — 2026-08-22, vault 55 notes

| backend | p50 (ms) | p95 (ms) | recall@5 | precision@5 | MRR | build (ms) | index size (bytes) | ชนะที่ query kind |
|---|---|---|---|---|---|---|---|---|
| ripgrep | 29.3–32.9 | 32.7–52.5 | 0.74 | 0.27 | 0.71 | 0 | 0 | `exact` (1.00) |
| fts5 | 0.06–0.07 | 0.15–0.17 | 0.72 | 0.25 | 0.75 | ~3 (incremental) | 671,744 | `keyword` (1.00) |
| vector | 0.14 | 0.30 | 0.78 | 0.26 | 0.79 | ~15–20 (cache warm) | 350,208 | `semantic` (0.67) |
| **router (route)** | **0.19–0.20** | 29.7–30.7 | **0.87** | 0.30 | 0.79 | ~15–17 | 1,021,952 | ทุก kind ยกเว้นที่ต้อง fuse |
| **router (fuse)** | 29.1–29.4 | 32.7–33.2 | **0.92** | **0.33** | **0.93** | ~15 | 1,021,952 | รวมทุกอย่าง (แพงสุด) |

รันซ้ำ 2 รอบ: **recall/precision/MRR เหมือนกันเป๊ะทุกรอบ** (deterministic 100% ตามที่ CLAUDE.md §2.1 ต้องการ) ส่วน latency แกว่ง ±5–15% ตามปกติของการวัด wall-clock บนเครื่องจริง (โดยเฉพาะ ripgrep ที่ผูกกับ OS process spawn) — อยู่ในเกณฑ์ที่ยอมรับได้

Index size ของ router = ผลรวม index ทั้ง 3 backend ที่มันห่ออยู่ (0 + 671,744 + 350,208 = 1,021,952) เพราะ router ต้อง index ทุก backend ที่มันอาจ route ไปเสมอ ไม่มีทางเลี่ยง

---

## W4-5 — สรุปโปรเจกต์

### ถ้าต้องเลือกตัวเดียวจริงๆ ที่ vault ขนาดนี้ (55 notes)

**FTS5** — เร็วที่สุดขาดลอย (0.06ms), recall รวม (0.72) แทบไม่ต่างจาก ripgrep (0.74) เลย, ไม่มีต้นทุน setup หนักแบบ vector (ไม่ต้องโหลด model 465MB) จุดอ่อนเดียวคือ `semantic` recall 0.07 แต่ที่ขนาด vault นี้ยังไม่มี query ภาระงานจริงมากพอที่จะทำให้ raw semantic ล้มเหลวจนกระทบธุรกิจ — ถ้าต้องเพิ่มความสามารถ semantic แบบง่ายที่สุดโดยไม่เพิ่มความซับซ้อนของ router ทั้งระบบ **router (route)** คือทางที่คุ้มที่สุด: ได้ recall 0.87 (เกือบเท่า fuse ที่ 0.92) โดยจ่าย latency เพิ่มจาก FTS5 แค่เศษเสี้ยว ms ในกรณีส่วนใหญ่

### ถ้า vault โต 100 เท่า (5,500 notes) — อันไหนพังก่อน

จากตัวเลข scaling ที่วัดจริงในแต่ละ workshop:

1. **ripgrep พังก่อนสุด** — WS01 วัดไว้ที่ 5,500 ไฟล์ p50 = 422ms (จาก 55 ไฟล์ = 34ms) โตเป็นเส้นตรงเพราะไม่มี index เลย จะกลายเป็นคอขวดของทั้งระบบทันทีถ้ายังใช้เป็น default หรือ fallback
2. **vector build time จะเริ่มเจ็บ** — cold-cache embed ทั้ง vault ใช้เวลา ~4.5 วินาทีที่ 228 chunks (55 notes) ถ้าโต 100 เท่า (~22,800 chunks) จะใช้เวลาประมาณ 450 วินาที (~7.5 นาที) สำหรับ cold reindex ครั้งแรก — ยังจัดการได้ด้วย incremental cache (WS03) แต่ initial cold start จะกลายเป็นปัญหาจริงสำหรับ deploy ใหม่
3. **FTS5 ยังไหวสบายที่สุด** — index size โตเป็นเส้นตรงตามเนื้อหา (671KB → ~67MB ที่ 100 เท่า) แต่ query latency (0.06ms) แทบไม่ขยับเพราะ B-tree/inverted index คือ O(log n) ไม่ใช่ O(n)
4. **ที่ 5,500+ notes เริ่มเข้าเขต ANN คุ้ม** — WS03 พบว่า brute-force เริ่มแพ้ ANN (IVF_FLAT) ที่ประมาณหลักหมื่นเวกเตอร์ ถ้า chunk เยอะขึ้นตามสัดส่วน (100×55=5,500 notes → ~22,800 chunks) เริ่มใกล้เคียงจุดที่ต้องพิจารณา ANN จริงจังแล้ว (แม้ยังไม่ถึง 10k เป๊ะ)

### Router คุ้มค่าความซับซ้อนที่เพิ่มมาไหม — ตอบด้วยตัวเลข

**route: คุ้มชัดเจน** — recall เพิ่มจาก backend เดี่ยวที่ดีที่สุด (vector 0.78) เป็น 0.87 (+11.5%) โดยจ่าย p50 เพิ่มจาก 0.06ms (fts5) เป็นแค่ 0.19–0.20ms (ยังเร็วกว่า 100 เท่าเทียบ ripgrep เดี่ยว) ความซับซ้อนที่เพิ่มคือแค่ query classifier ~60 บรรทัดโค้ด deterministic ล้วนๆ ตรวจสอบได้ทุกขั้นตอน

**fuse: คุ้มก็ต่อเมื่อ recall สำคัญกว่าความเร็วมาก** — recall สูงสุดในทุกวิธี (0.92, +18% จาก vector เดี่ยว) แต่แพงกว่า route ถึง **209 เท่า** (30ms vs 0.14ms) เพราะต้องรอ ripgrep เสมอ เหมาะกับ use case ที่ไม่ sensitive เรื่อง latency (เช่น batch job สร้างรายงาน) ไม่เหมาะกับ user-facing search ที่ต้องการ response เร็ว

**บทสรุปโดยรวมของทั้งโปรเจกต์:** ไม่มี "คำตอบเดียวที่ถูกที่สุด" — คำตอบขึ้นกับ query pattern จริงและงบประมาณ latency ของระบบ นี่คือเหตุผลทั้งหมดที่ production ไม่เลือก backend ตัวเดียว และเป็นเหตุผลที่ hybrid router ที่อธิบายได้ทุกการตัดสินใจ (`routedBy` logging) สำคัญกว่าการเดาว่า backend ไหน "ดีที่สุด" แบบเหมารวม
