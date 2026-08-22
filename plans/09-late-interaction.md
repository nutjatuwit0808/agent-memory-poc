# Workshop 09 — Late interaction / multi-vector (ColBERT)

## คำถามตั้งต้น

- เก็บ embedding **ทุก token** แทนที่จะยุบเหลือเวกเตอร์เดียว แม่นขึ้นจริงไหมบน vault นี้
- index ใหญ่ขึ้นกี่เท่า — และที่ vault ขนาดนี้ **ยังคุ้มอยู่ไหม**
- MaxSim ทำงานยังไง ต่างจาก cosine ของเวกเตอร์เดียว (WS03) ตรงไหน

## ทฤษฎีสั้น (เขียนลง README ตอนทำ)

WS03 ทำ **mean pooling** — ยุบ embedding ของทุก token ในเอกสารให้เหลือเวกเตอร์เดียว 384 มิติ ข้อมูลระดับคำหายไปหมดในขั้นตอนนั้น เอกสารยาวที่พูดหลายเรื่องจะได้เวกเตอร์ที่เป็น "ค่าเฉลี่ยของทุกเรื่อง" ซึ่งอาจไม่ตรงกับเรื่องไหนเลย (นี่คือเหตุผลหนึ่งที่ W3-2 ต้องทำ chunking)

**Late interaction (ColBERT):** เก็บเวกเตอร์ของ **ทุก token** ไว้ แล้วตอน query คำนวณ

```
MaxSim: score(doc) = Σ         max        (q_i · d_j)
                   token i ใน query   token j ใน doc
```

คือ **แต่ละ token ใน query ไปหา token ที่ตรงที่สุดของตัวเองใน document** แล้วเอาคะแนนมารวมกัน — จับคู่ระดับคำได้เหมือน BM25 แต่ยังเป็น semantic เหมือน dense

เรียกว่า "late" เพราะการมีปฏิสัมพันธ์ระหว่าง query กับ document เกิด **ทีหลัง** (ตอน query) ต่างจาก cross-encoder (WS07) ที่เกิดตั้งแต่ต้น — จึงยัง precompute document ได้ ต่างจาก cross-encoder ที่ทำไม่ได้เลย

**ตำแหน่งบนสเปกตรัม:** bi-encoder (เร็วสุด/หยาบสุด) → **late interaction** → cross-encoder (ช้าสุด/แม่นสุด)

---

## ⚠️ ความเสี่ยงหลัก — index ระเบิด

ประมาณการจากตัวเลขจริงของ WS03: 228 chunks × ~80 token/chunk × 384 มิติ × 4 bytes ≈ **28 MB**
เทียบกับ dense index ปัจจุบันที่ **350 KB** → **ใหญ่ขึ้นราว 80 เท่า**

ColBERT จริงๆ แก้ด้วยการลดมิติ (768 → 128) + quantization ซึ่งเป็นสาเหตุที่มีงานวิจัยปี 2026 อย่าง ColBERTSaR ที่เอา PQ มาบีบ index — **แต่ WS03 พิสูจน์มาแล้วว่า PQ ทำ recall พังยับ (0.20)** จึงต้องระวังเป็นพิเศษว่าจะไม่ตกหลุมเดิม

**ความเสี่ยงที่สอง:** ColBERT ต้องใช้ checkpoint ที่ **เทรนมาแบบ ColBERT โดยเฉพาะ** เอา BERT ธรรมดามาใช้ไม่ได้ (เวกเตอร์ระดับ token ของโมเดลทั่วไปไม่ได้ถูกฝึกให้เทียบกันข้ามประโยค) ตัว multilingual ที่มีชื่อคือตระกูล `jina-colbert-v2` — ต้องเช็คว่ามี ONNX build ที่รันบน transformers.js ได้จริง

---

## W9-1 — Spike: หา checkpoint + ประเมินขนาดจริง

**ทำ:** ยืนยัน 3 อย่างก่อนเขียนโค้ด

1. หา ColBERT checkpoint ที่รองรับหลายภาษา + มี ONNX
2. **วัดขนาด index จริง** ไม่ใช่ประมาณ — embed 10 chunk แล้วคูณ
3. ทดสอบ MaxSim ด้วยมือกับ 2–3 คู่ ว่าให้ผลสมเหตุสมผล

**DoD**
- [ ] จดชื่อ checkpoint + มิติต่อ token + ขนาดไฟล์โมเดล
- [ ] **ขนาด index ที่คำนวณจากของจริง** เทียบกับ dense (350,208 B) และ fts5 (671,744 B)
- [ ] **ถ้าหา checkpoint multilingual ไม่ได้ → หยุดแล้วยกขึ้นมาคุย** (เอา BERT ธรรมดามาทำ MaxSim จะได้ผลที่ตีความไม่ได้ แล้วสรุปผิดว่า late interaction ไม่ดี)
- [ ] ถ้าต้องเพิ่ม dependency → ถามก่อน (CLAUDE.md §7)

---

## W9-2 — เก็บ multi-vector

**ทำ:** ขยาย embedding cache เดิม (WS03) ให้เก็บเวกเตอร์หลายตัวต่อ chunk

ต้องตัดสินและจดเหตุผล: เก็บเป็น BLOB ก้อนเดียวต่อ chunk (อ่านเร็ว จัดการง่าย) หรือแยกแถวต่อ token (query ยืดหยุ่นกว่า แต่แถวเยอะมาก)
เสนอ **BLOB ก้อนเดียวต่อ chunk** เพราะ MaxSim ต้องใช้ทุก token ของ chunk นั้นพร้อมกันอยู่แล้ว การแยกแถวจึงไม่ได้ประโยชน์

**DoD**
- [ ] cache key ต้องมีชื่อโมเดล (บทเรียนจาก W3-3 — เปลี่ยนโมเดลแล้ว cache เก่าต้องใช้ไม่ได้)
- [ ] ไม่ทับ/ทำลาย cache ของ WS03 (คนละ key คนละตาราง)
- [ ] รายงานเวลา build + ขนาดจริงหลัง index ครบทั้ง vault

---

## W9-3 — `colbert.backend.ts` + MaxSim เขียนเอง

**ทำ:** เขียน MaxSim เองทั้งหมด (ห้ามใช้ library ที่ทำให้จบในบรรทัดเดียว — ตาม CLAUDE.md §1)

```ts
// สำหรับแต่ละ token ใน query หา token ใน doc ที่ dot product สูงสุด แล้วรวมทุก token ของ query
// เวกเตอร์ normalize แล้วทั้งสองฝั่ง (เหมือน W3-4) dot product จึงเท่ากับ cosine ตรงๆ
```

**Latency ต้องแยกรายงาน 3 ส่วน:** `embedQueryMs` / `maxSimMs` / `totalMs` — MaxSim เป็น O(|q| × |d|) ต่อเอกสาร ซึ่งหนักกว่า cosine เดี่ยวๆ มาก ต้องเห็นว่าหนักตรงไหน

**DoD**
- [ ] MaxSim เขียนเอง มี comment อธิบายสูตรทีละพจน์
- [ ] implement 3 method ครบ ไม่แก้ signature · `matchedBy: "vector"`
- [ ] แยกเวลา 3 ส่วนตามข้างบน
- [ ] **diagnostic: บอกได้ว่า token ไหนใน query จับคู่กับ token ไหนใน document** — นี่คือสิ่งที่ dense เดี่ยวๆ ทำไม่ได้ และเป็นจุดที่เห็นกลไกชัดที่สุด

---

## W9-4 — วัดผล

**ต้องตอบให้ได้:**
- เทียบกับ dense (WS03) บน query kind เดิมทุกช่อง — โดยเฉพาะ **`exact` ที่ dense ได้แค่ 0.47** เพราะ late interaction ควรจับ identifier ได้ดีกว่า (จับระดับ token)
- **ต้นทุนต่อ recall ที่ได้เพิ่ม**: index ใหญ่ขึ้น N เท่า, latency เพิ่ม M เท่า แลกกับ recall +X — คุ้มไหม
- เทียบกับ **cross-encoder (WS07)** ว่าอยู่ตรงไหนบนสเปกตรัม speed/accuracy

**DoD**
- [ ] ตารางเทียบ dense vs late-interaction vs cross-encoder แยกตาม query kind
- [ ] มีตัวเลข index size และ latency เทียบชัด
- [ ] ยกเคสจริงพร้อม **แผนภาพการจับคู่ token** ที่อธิบายว่าทำไมผลต่างจาก dense

---

## W9-5 — README

**DoD**
- [ ] ครบ 5 หัวข้อตาม CLAUDE.md §5
- [ ] สรุปสเปกตรัมทั้งหมดของโปรเจกต์: literal → BM25 → learned sparse → dense → late interaction → cross-encoder **พร้อมตัวเลขจริงของแต่ละตัวจาก workshop ที่ผ่านมา**
- [ ] ตอบตรงๆ ว่าที่ vault 55 notes **late interaction คุ้มหรือไม่** — คำตอบ "ไม่คุ้ม เพราะ index ใหญ่ขึ้น 80 เท่าแลกกับ recall ที่ขยับนิดเดียว" เป็นข้อสรุปที่มีค่าและยอมรับได้
- [ ] `core/` ไม่ถูกแก้
