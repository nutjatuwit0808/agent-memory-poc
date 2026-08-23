# Workshop 06 — Graph traversal (ใช้ wikilink ที่มีอยู่แล้ว)

## คำถามตั้งต้น

- เอกสารที่ถูกต้อง **อยู่ห่างจากผลลัพธ์อันดับ 1 แค่ 1 hop** หรือเปล่า
- link graph ที่ `core/` parse เก็บไว้ตั้งแต่ P0-3 แต่ **ไม่มี backend ไหนแตะเลยตลอด WS01–05** มีค่าจริงไหม
- multi-hop query backend เดิมทำได้แค่ไหน

## ทฤษฎีสั้น

WS01–05 ทุกตัวหาจาก "ความคล้ายกับ query" อย่างเดียว แต่ความรู้จริงในวอลต์**เชื่อมกันเป็นกราฟ** — `refund-policy.md` ชี้ไป `error-code-convention.md`, `case-3401.md` ชี้ไป `refund-timeout-policy.md` คำถามบางแบบต้องเดินตามเส้นเชื่อมถึงจะตอบครบ ไม่ใช่แค่หาเอกสารที่คล้าย query ที่สุด

**graph expansion:** เอา top-k จาก backend เดิมเป็น "เมล็ด" (seed) แล้วขยายออกไปตาม link 1–2 hop โดยให้คะแนนลดลงตามระยะ (decay)

**ต่างจาก GraphRAG กระแสหลักตรงไหน:** GraphRAG ทั่วไปสร้างกราฟด้วยการให้ **LLM สกัด entity/relation** จากข้อความ ซึ่ง CLAUDE.md §1 ตัดทิ้งไปแล้ว ("LLM extraction — ไม่ใช้") workshop นี้ใช้ wikilink ที่มนุษย์เขียนไว้เองตอนเขียน note จึงเป็นกราฟที่ **deterministic 100% และไม่ต้องเพิ่ม dependency สักตัว**

---

## W6-1 — ขยาย query set ด้วย multi-hop

เพิ่ม kind ใหม่ `multi-hop` 5 ข้อใน [`bench/queries.json`](../../bench/queries.json) แต่ละข้อออกแบบจาก**เส้นทางที่มีอยู่จริงในกราฟ** (ไม่ใช่เดา) เช่น:

| query | เส้นทางจริงในกราฟ |
|---|---|
| "ขอคืนเงินซ้ำ... error code ตามมาตรฐานไหน" | `refund-policy.md` → `error-code-convention.md` (direct link) |
| "incident payment gateway... เช็ค alert ไหนก่อน scale" | `incident-response-runbook.md` → `monitoring-alerts.md` → `scaling-policy.md` (2 hop) |
| "เคส refund ค้าง... เกี่ยวกับ timeout infrastructure" | `case-3401.md` → `refund-timeout-policy.md` → `connection-timeout-tuning.md` (2 hop) |

ยืนยันด้วย validator ว่าทุกข้อมี relevant files ที่เชื่อมกันด้วย link จริง (undirected) — **PASS ทั้ง 5 ข้อ**

### Baseline ก่อนมี graph (สำคัญที่สุด — ใช้เทียบทั้ง workshop)

| backend | multi-hop recall@5 |
|---|---|
| ripgrep | 0.70 |
| fts5 | **0.83** |
| vector | 0.63 |
| router-route | 0.63 |
| **router-fuse** | **1.00** |

**ข้อสังเกตที่ต้องซื่อสัตย์ตั้งแต่ต้น:** `router-fuse` ได้ recall เต็ม 1.00 อยู่แล้วโดยไม่มี graph เลย เพราะ fuse รวมผลจากทั้ง 3 backend เข้าด้วยกัน — เอกสาร "hub" ที่ query ออกแบบไว้ (เช่น `error-code-convention.md`, `scaling-policy.md`) มีคำศัพท์ที่ literal/semantic matching หาเจอได้อยู่แล้วเมื่อรวมทุกมุมมอง งานของ graph ใน workshop นี้จึงไม่ใช่ "ทำให้ multi-hop หาเจอได้" (fuse ทำได้แล้ว) แต่คือ **"ทำให้ backend เดี่ยวๆ ที่เร็วกว่า fuse มาก ได้ผลใกล้เคียง fuse โดยไม่ต้องยิงทั้ง 3 backend"**

ยืนยัน query เดิม 20 ข้อให้ผลเท่าเดิมเป๊ะ (เทียบ per-kind กับ WS04 — ตรงทุกตัว)

---

## W6-2 — Link graph

[`src/search/backends/link-graph.ts`](../../src/search/backends/link-graph.ts) สร้าง adjacency list จาก `note.links` ที่ `core/` parse ไว้แล้ว ไม่แก้ `core/` เลย

**สถิติกราฟจริงของ vault นี้:**

```
noteCount: 55
edgeCount: 125
avgDegree: 3.2
maxDegree: 11
orphanCount: 0      <- ไม่มี note ไหนลอยเดี่ยวไม่เชื่อมกับอะไรเลย
danglingLinks: []   <- ยืนยันอีกครั้ง (WS01–05 เคยเช็คแล้วเป็น 0)
```

`refund-policy.md` เป็น hub ตัวหนึ่ง — 8 undirected neighbor (ถูกอ้างถึงจาก `dispute-resolution-process`, `fraud-detection-rules`, `long-form-order-state-machine`, `long-form-payment-lifecycle` และอื่นๆ)

เก็บ **forward และ backward แยกกัน** (ไม่ใช่ merge ทันที) เพราะ backlink มีความหมายต่างจาก forward link — note ที่ "ถูกอ้างถึงบ่อย" (backlink เยอะ) มักเป็นเอกสารหลักที่คนอื่นอ้างอิง ในขณะที่ note ที่ "ลิงก์ออกไปเยอะ" (forward เยอะ) มักเป็นเอกสารสรุป/ภาพรวม

---

## W6-3 — `graph.backend.ts`

[`src/search/backends/graph.backend.ts`](../../src/search/backends/graph.backend.ts) — ห่อ backend อื่นไว้ข้างใน (แบบเดียวกับ `RouterBackend`)

### สูตรคะแนน (ปรับจาก D-9 หลังพบว่าสเปกขัดกันเอง)

D-9 เสนอไว้แรกเริ่มว่า `score(note) = max(seedScore × decay^hop)` แต่ W6-3 เองระบุว่า **"note ที่ถูกชี้จากหลาย seed ต้องได้คะแนนสะสม"** ซึ่งเป็น sum ไม่ใช่ max — สองข้อนี้ขัดกันถ้าตีความตรงตัว จึงแก้เป็น:

```
score(note) = Σ (สำหรับแต่ละ seed ที่ไปถึง note นี้ได้)
                  best(seedScore × decay^hop)  ต่อ seed นั้นตัวเดียว
```

คือ **max ภายในเส้นทางเดียวกัน (seed เดิม hop ต่างกัน เอา hop สั้นสุด) แต่ sum ข้าม seed** ที่ต่างกัน — ทำให้ note ที่ seed หลายตัวเห็นตรงกันว่าเกี่ยวข้อง ลอยขึ้นสูงกว่า note ที่ seed เดียวชี้มา สอดคล้องกับหลักการเดียวกับ RRF ใน WS04

### Diagnostic

`getLastProvenance()` คืนทุกคู่ (noteId, seedId, hop, contribution) เรียงตามคะแนน — ตรวจสอบได้เสมอว่าทำไมไฟล์หนึ่งถึงติดอันดับ เช่น

```
business-logic/long-form-payment-lifecycle.md  hop=1 via=business-logic/refund-policy.md              contrib=0.3157
business-logic/long-form-payment-lifecycle.md  hop=1 via=business-logic/long-form-order-state-machine.md contrib=0.3040
business-logic/long-form-payment-lifecycle.md  hop=1 via=business-logic/payment-retry-policy.md         contrib=0.2634
                                                                                          รวม = 0.8831
```

---

## W6-4 — วัดผล

### hops × direction (seed = router-route, 25 query ทั้งชุด)

| config | multi-hop recall | exact recall | overall recall | p50 (ms) |
|---|---|---|---|---|
| **h=1 forward** | 0.70 | 1.00 | **0.86** | 0.209 |
| h=1 backward | 0.63 | 1.00 | 0.82 | 0.193 |
| h=1 undirected | 0.63 | 1.00 | 0.85 | 0.207 |
| h=2 forward | 0.57 ⚠️ | 1.00 | 0.80 | 0.229 |
| h=2 backward | 0.63 | 1.00 | 0.82 | 0.204 |
| h=2 undirected | 0.63 | 1.00 | 0.85 | 0.227 |

**h=2 แย่กว่า h=1 เสมอ (หรือเท่ากันอย่างดีที่สุด)** — ตรงกับที่ D-9 กังวลไว้ตั้งแต่ต้น: hop ที่ 2 ลากเอกสารที่ไม่เกี่ยวเข้ามาเป็น noise จน multi-hop recall ร่วงจาก 0.70 เหลือ 0.57 ที่ config `forward` **นี่คือหลักฐานว่า 1 hop คือจุดที่คุ้มที่สุดสำหรับ vault ขนาดนี้** ไม่ใช่แค่เดา — ตัดสินใจ**เลือก h=1 forward เป็น default**

**latency แทบไม่ขยับ** (0.19–0.23ms ทุก config) เพราะ traversal เป็นแค่ in-memory Map lookup ตรงตามที่คาดไว้ใน DoD

### เทียบ seed backend (h=1, undirected)

| seed | multi-hop recall | exact recall | overall recall |
|---|---|---|---|
| ripgrep | 0.70 | 1.00 | 0.74 |
| **fts5** | **0.83** | 1.00 | 0.77 |
| vector | 0.63 | 0.47 | 0.78 |
| router-route | 0.63 | 1.00 | **0.85** |

`router-route` ชนะ overall เพราะมันเลือก backend ที่ดีที่สุดต่อ query kind อยู่แล้วตั้งแต่ WS04 — เป็นฐานที่ graph ต่อยอดได้ดีที่สุด ยืนยัน D-10 ที่เสนอไว้แต่แรก

### ตาราง delta ที่สำคัญที่สุด — graph เปลี่ยนอะไรจาก baseline จริงๆ (ต่อ seed ต่อ kind)

**h=1 forward (config ที่เลือกใช้จริง) ลบด้วย baseline (ไม่มี graph):**

| seed | exact | keyword | semantic | filtered | multi-hop |
|---|---|---|---|---|---|
| ripgrep | +0.00 | **−0.10** ⚠️ | **+0.13** | +0.00 | +0.00 |
| fts5 | +0.00 | +0.00 | **+0.13** | +0.00 | +0.00 |
| vector | −0.03 | +0.00 | **+0.13** | **−0.10** ⚠️ | **+0.07** |
| router-route | +0.00 | +0.00 | **+0.13** | +0.00 | **+0.07** |

**สามข้อสรุปจากตารางนี้ ไม่ใช่จากความรู้สึก:**

1. **`semantic` ดีขึ้น +0.13 สม่ำเสมอทุก seed** — นี่คือ effect ที่ชัดและกว้างที่สุดของ graph ทั้ง workshop ไม่ใช่แค่ multi-hop ตามที่ตั้งใจแต่แรก เพราะคำตอบของ query แบบ semantic หลายข้อ**อยู่ห่างจาก top-1 แค่ 1 hop จริง** (ดูตัวอย่างด้านล่าง)
2. **multi-hop ดีขึ้นแค่ที่ vector/router-route เท่านั้น (+0.07)** ไม่ใช่ทุก seed — fts5/ripgrep ไม่ขยับเลยเพราะ baseline ของมันดีอยู่แล้ว (0.70–0.83) ไม่มีที่ว่างให้ปรับปรุงมาก
3. **single-hop แย่ลงจริงตามที่ D-9 กังวล** — `ripgrep+keyword` ร่วง 0.10 (link ลาก note ที่ไม่เกี่ยวเข้ามาแทนที่ผลลัพธ์เดิมที่ถูกอยู่แล้ว) และ `vector+filtered` ร่วง 0.10 เช่นกัน **นี่คือ noise ที่คาดไว้ ไม่ใช่บั๊ก** — ถ้าตัวเลขนี้ไม่มีเลยสักช่องต้องสงสัยว่าวัดผิดตามที่ DoD เตือนไว้

### เคสจริงที่ graph ดึงเอกสารถูกขึ้นมาได้

Query `"ลูกค้าขอคืนเงินแล้วระบบค้าง"` (semantic, seed=router-route):

```
baseline (1/3 relevant): case-3401, refund-policy, case-2891, payment-retry-policy, case-3344
graph    (3/3 relevant): refund-timeout-policy, case-3401, refund-policy, module-refund, case-2891
```

recall@5 พุ่งจาก **33% เป็น 100%** เพราะ graph ดึง `refund-timeout-policy.md` เข้ามา (hop=1 ผ่าน `case-3401.md`) และ `module-refund.md` (hop=1 ผ่าน `refund-policy.md`) — ทั้งสองไฟล์นี้**ไม่เคยติด top-5 ของ baseline เลย** ทั้งที่เกี่ยวข้องโดยตรง เพราะคำในเนื้อหาไม่ตรงกับคำใน query แต่ **เชื่อมกันด้วย link จริง**

---

## W6-5 — สรุป

**กราฟที่คนเขียนเองด้วยมือ (wikilink) เทียบกับกราฟที่ LLM สกัดให้ (GraphRAG กระแสหลัก) ในบริบทนี้:**

ข้อดีของทางที่เลือก (wikilink): deterministic 100%, ตรวจสอบได้ทุกเส้นทางด้วย `getLastProvenance()`, ไม่มีต้นทุน LLM call หรือความเสี่ยงจาก entity extraction ผิดพลาด, 0 dependency ใหม่ — แต่**แลกมาด้วยความครอบคลุม**: กราฟจะดีได้แค่ระดับที่คนเขียน note ใส่ wikilink ไว้ดีแค่ไหน (vault นี้ orphan=0 เพราะตั้งใจออกแบบให้เชื่อมกันตั้งแต่ P0-5) ถ้าเนื้อหาจริงไม่มีวินัยเรื่อง cross-reference กราฟนี้จะบางกว่าที่ LLM extraction สร้างให้มาก

**สรุปเป็นตัวเลข:** graph (h=1, forward, seed=router-route) ให้ recall@5 รวม **0.86** — ดีกว่า router-route เดี่ยว (0.82, +0.04) ที่ latency แทบไม่ต่าง (0.19ms vs 0.18ms) และเข้าใกล้ router-fuse (0.93) โดยไม่ต้องจ่ายต้นทุน 160+ เท่าของการยิงทั้ง 3 backend พร้อมกัน **graph คือทางเลือกที่คุ้มระหว่าง route กับ fuse** — ได้ recall เพิ่มขึ้นจริง แลกด้วยความซับซ้อนที่น้อยกว่า fuse มาก และไม่มีต้นทุน dependency เพิ่มเลยสักตัว

ข้อจำกัดที่ต้องรู้: ปรับปรุงชัดที่สุดที่ `semantic` (+0.13 ทุก seed) ไม่ใช่ `multi-hop` ตามชื่อ workshop และมี noise จริงที่บาง kind (`keyword`/`filtered` บาง seed ร่วง 0.10) — ต้องเลือก seed + hop + direction ให้เหมาะกับ use case ไม่มีค่าเดียวที่ดีที่สุดสำหรับทุกกรณี
