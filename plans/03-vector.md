# Workshop 03 — Vector search

## คำถามตั้งต้น

- เมื่อไหร่ semantic ชนะ keyword และเมื่อไหร่ที่มันแพ้ (สำคัญพอกัน)
- แลกมากับ cost/latency เท่าไหร่จริงๆ
- ANN ต่างจาก brute-force ยังไงที่ vault ขนาดนี้ — คุ้มไหม

## ทฤษฎีสั้น (เขียนลง README ตอนทำ)

Embedding = แปลงข้อความเป็นเวกเตอร์ที่ข้อความความหมายใกล้กันอยู่ใกล้กันในสเปซ → "คืนเงิน" กับ "refund" ใกล้กันได้ทั้งที่ไม่มีตัวอักษรร่วมกันเลย
cosine similarity วัดมุมไม่ใช่ระยะ → ความยาวเอกสารไม่มีผลโดยตรง
ราคาที่จ่าย: ต้องเรียก model ตอน index **และตอน query ทุกครั้ง** — latency ก้อนใหญ่ย้ายมาอยู่ที่ query path ซึ่งต่างจาก FTS5 โดยสิ้นเชิง

---

## W3-1 — Embedding pipeline

**D-4 ✅ ตัดสินแล้ว: `paraphrase-multilingual-MiniLM-L12-v2` ผ่าน `@huggingface/transformers` (รันในเครื่อง)**
เหตุผล: ตัวเลข bench ที่ทำซ้ำได้ 100% สำคัญกว่าคุณภาพสูงสุดในบริบท case study — และ vault มีเนื้อหาไทยซึ่งเป็นจุดที่ FTS5 tokenizer แพ้อยู่แล้ว (ดู W2-2)
*(ทางที่ไม่เลือก: OpenAI `text-embedding-3-small` คุณภาพดีกว่าแต่ latency ผันผวนตามเน็ต ทำให้เทียบกับ FTS5 ไม่ยุติธรรม · `all-MiniLM-L6-v2` เล็กเร็วกว่าแต่ไทยอ่อน)*

**ผลที่ตามมา ต้องรับมือ:**
- model ~470MB โหลดครั้งแรก → cache ไว้ที่ `data/models/` และ **ไม่นับเวลาโหลด model เป็น buildTimeMs** (มันคือ one-time setup ไม่ใช่ต้นทุน index) แต่ต้องรายงานแยกไว้ให้เห็น
- dimension 384, max 128 token → **สั้นกว่าที่คิด** เป็นเหตุผลที่ chunking ใน W3-2 ไม่ใช่ทางเลือกแต่เป็นข้อบังคับ
- รันบน CPU → ต้องวัด throughput จริงว่า embed ทั้ง vault ใช้เวลาเท่าไหร่

**ทำ:** wrapper บางๆ รอบ pipeline — โหลด model, embed batch, normalize เวกเตอร์, คืน Float32Array

**DoD**
- [ ] จด model name + dimension + max token + ขนาดไฟล์ ลง README
- [ ] วัด throughput: embed 100 chunk ใช้เวลากี่ ms (CPU รุ่นอะไร)
- [ ] แยกเวลาโหลด model ออกจาก buildTimeMs ชัดเจน
- [ ] `data/models/` อยู่ใน .gitignore (เป็น derived state ตาม CLAUDE.md §2.2)
- [ ] ทดสอบว่าข้อความไทยได้เวกเตอร์ที่สมเหตุสมผล — cos("คืนเงิน", "refund") ต้องสูงกว่า cos("คืนเงิน", "deploy")

---

## W3-2 — Chunking

**ทำ:** chunk ตามหัวข้อ markdown (`##`) แนบ frontmatter context ทุก chunk แล้ว**เทียบกับ whole-note เป็น baseline**

model ตัดที่ 128 token (จาก W3-1) — note >2000 คำ จาก P0-5 จะถูกตัดทิ้งเกือบทั้งไฟล์ถ้า embed ทั้งก้อน นี่ไม่ใช่ทางเลือกแล้วแต่เป็นข้อบังคับ ที่ยังต้องทำ whole-note เทียบด้วยเพราะ **ต้องเห็นด้วยตัวเลขว่า truncation ทำ recall พังแค่ไหน** ไม่ใช่เชื่อตามทฤษฎี

chunk ที่ตัดกลางเรื่องจะขาด context จนหาไม่เจอ → แนบ `layer` + `tags` + หัวข้อแม่ เข้าไปในข้อความที่ embed ทุก chunk แต่ต้องระวังว่า metadata กินโควตา 128 token ไปด้วย — วัดว่ากินไปกี่ %

**ต้องตัดสิน:** score ระดับ note มาจาก chunk ที่ดีที่สุด หรือค่าเฉลี่ย — เขียนเหตุผลลง README (max = ลำเอียงเข้าหา note ยาว, mean = เจือจางเมื่อ note ครอบคลุมหลายเรื่อง)

**DoD**
- [ ] มีตัวเลขเทียบ whole-note vs chunked บน query set เดียวกัน
- [ ] chunk แนบ metadata ของ note ต้นทาง + วัดว่า metadata กินโควตา token ไปกี่ %
- [ ] วิธีรวม score เขียนเป็นสูตรที่คำนวณตามได้
- [ ] จดจำนวน chunk ต่อ note (min/median/max) — เป็นตัวคูณของต้นทุน embedding ทั้งหมด

---

## W3-3 — Embedding cache

**ไฟล์:** `src/search/backends/embedding-cache.ts` + `data/embeddings.sqlite`

**ทำ:** key = `sha256(model + ":" + chunkText)` → value = Float32Array

ไม่มี cache = reindex ทีนึงจ่ายเต็มทุกครั้ง ทั้งเวลาและเงิน — cache คือสิ่งที่ทำให้เห็นว่า **ต้นทุน embedding เป็น one-time ต่อ content ไม่ใช่ต่อ reindex**

ใส่ model name ใน key ด้วย เพราะเปลี่ยน model แล้วเวกเตอร์เก่าใช้ไม่ได้ (คนละสเปซ) — จุดนี้เป็น bug ที่เจอบ่อยในระบบจริง

**DoD**
- [ ] reindex ครั้งที่ 2 โดยไม่แก้อะไร → cache hit 100%, buildTime ลดลงชัดเจน
- [ ] แก้ 1 note → มีแค่ chunk ของ note นั้นที่ miss
- [ ] เปลี่ยน model name → miss ทั้งหมด (พิสูจน์ว่า key ถูก)
- [ ] จดเวลา embed ทั้ง vault 1 ครั้งแบบ cold cache (local model → ต้นทุนเป็นเวลา CPU ไม่ใช่เงิน แต่ก็ยังเป็นต้นทุนที่ต้องรายงาน)

---

## W3-4 — vector.backend.ts (brute-force)

**ไฟล์:** `src/search/backends/vector.backend.ts`

**ทำ:** เขียน cosine similarity เอง + สแกนทุกเวกเตอร์

เขียนเองก่อนเสมอตาม CLAUDE.md §1 — brute-force ที่ 50 note คือ 50 dot product เร็วมากอยู่แล้ว และมันคือ **ผลลัพธ์ที่ถูกต้อง 100%** ซึ่งจะใช้เป็น ground truth วัดว่า ANN ใน W3-5 recall หายไปเท่าไหร่

**Latency ต้องแยกรายงาน:** `embedQueryMs` vs `searchMs` — ถ้ารวมกันจะสรุปผิดว่า vector search ช้า ทั้งที่ช้าเพราะ embed query ไม่ใช่เพราะ search

**DoD**
- [ ] cosine เขียนเอง มี comment อธิบายสูตร
- [ ] `matchedBy: "vector"`
- [ ] filter layer/tag ทำงาน (pre-filter ได้เพราะ metadata อยู่ในหน่วยความจำ)
- [ ] แยก `embedQueryMs` / `searchMs` ใน output
- [ ] ยืนยันว่า normalize เวกเตอร์แล้ว (ไม่งั้น cosine เพี้ยน)

---

## W3-5 — ANN (LanceDB) + scaling study

**D-5 ✅ ตัดสินแล้ว: ทำ พร้อม corpus สังเคราะห์ ≥10k เวกเตอร์**
เหตุผล: ที่ 50 note brute-force ชนะ ANN แน่นอน — วัดที่ขนาดนั้นแล้วสรุปว่า "ANN ช้ากว่า" คือข้อสรุปที่ผิดและแย่กว่าไม่วัดเลย ต้องขยาย corpus ถึงจะเห็นจุดตัดจริง

**⚠ task นี้แยกอิสระจาก W3-6** — ถ้าติดปัญหาให้ข้ามไปทำ W3-6 (bench 3 backend) ให้จบก่อน แล้วค่อยกลับมา เพราะ WS04 ไม่ได้พึ่งผลของ task นี้

**ทำ:**
1. สร้าง corpus สังเคราะห์ 10k / 50k / 100k เวกเตอร์ — **จะ generate ยังไงต้องระวัง** ถ้าสุ่มเวกเตอร์แบบ uniform จะได้สเปซที่ไม่มีคลัสเตอร์ ซึ่ง ANN จะทำงานแย่ผิดปกติ ต้องสร้างแบบมีคลัสเตอร์ให้ใกล้เคียงการกระจายตัวของ embedding จริง
2. รัน brute-force เก็บผลเป็น **ground truth** (แม่นยำ 100% ตามนิยาม)
3. รัน LanceDB ที่ขนาดเดียวกัน เทียบทั้ง latency และ recall

**ตารางที่ต้องได้:**

| corpus size | brute-force p50 | ANN p50 | ANN recall@10 |
|---|---|---|---|
| 50 (vault จริง) | | | |
| 10k | | | |
| 50k | | | |
| 100k | | | |

**DoD**
- [ ] วิธี generate corpus เขียนไว้ชัด รวมถึงเหตุผลว่าทำไมต้องมีคลัสเตอร์
- [ ] มีตัวเลขจุดตัดที่ ANN เริ่มชนะ (ประมาณจากข้อมูลจริง ไม่ใช่เดา)
- [ ] recall@10 ของ ANN ทุกขนาด เทียบ brute-force
- [ ] จดว่า LanceDB ซ่อน param อะไรไว้ (index type, nprobes, ef) และค่า default คืออะไร — ตรงกับ CLAUDE.md §1 ที่ไม่ชอบ abstraction ที่ซ่อนกลไก ถ้าปรับ param ได้ให้ลองปรับแล้วดูว่า recall/speed ขยับยังไง
- [ ] สรุปให้ชัดว่า vault ขนาดจริงอยู่ตรงไหนของกราฟ — คำตอบน่าจะเป็น "ยังไม่ถึงจุดที่ต้องใช้ ANN" และนั่นคือข้อสรุปที่มีค่า

---

## W3-6 — วัดผล + README

**ต้องตอบให้ได้ด้วยตัวเลข:**
- query kind `semantic` — vector ชนะ FTS5 กี่ %? ยกเคสจริงจาก vault (คู่ "คืนเงิน"/"refund" จาก P0-5)
- query kind `exact` — **vector แพ้แค่ไหน?** ค้น env var หรือชื่อฟังก์ชันด้วย vector จะพลาด ต้องโชว์เคสนี้ให้ชัด เพราะมันคือเหตุผลทั้งหมดของ WS04
- ต้นทุนรวม: buildTime, ขนาด index, latency ต่อ query (แยก embed/search)

**DoD**
- [ ] ตาราง 3 backend เทียบกัน
- [ ] มีเคสที่ vector ชนะ **และ** เคสที่ vector แพ้ อย่างละอย่างน้อย 2
- [ ] README ครบ 5 หัวข้อ
- [ ] `core/` ไม่ถูกแก้ (ยืนยันด้วย diff)
