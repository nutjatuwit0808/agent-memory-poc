# Workshop 08 — Learned sparse retrieval (SPLADE)

## คำถามตั้งต้น

- sparse ที่ "เรียนรู้มา" ต่างจาก BM25 (WS02) ยังไง ในเมื่อทั้งคู่ลงเอยที่ inverted index เหมือนกัน
- **แก้ปัญหา tokenizer ตัดคำไทยไม่ได้ ที่ WS02 เจอ ได้ไหม**
- ถ้าไม่ train เองกับ domain นี้ จะแพ้ BM25 จริงตามที่งานวิจัยเตือนไหม

## ทฤษฎีสั้น (เขียนลง README ตอนทำ)

BM25 (WS02) ให้น้ำหนักคำจาก **สถิติล้วนๆ** (term frequency + IDF + length norm) — คำที่ไม่ปรากฏในเอกสารมีน้ำหนัก 0 เสมอ ต่อให้ความหมายตรงกันแค่ไหน (นี่คือเหตุผลที่ semantic recall = 0.07)

**SPLADE** ใช้ BERT ทำนายว่า "เอกสารนี้ควรมีน้ำหนักที่คำไหนใน vocabulary บ้าง" → ได้เวกเตอร์ sparse ที่**มีน้ำหนักในคำที่ไม่ได้ปรากฏในเอกสารด้วย** (term expansion) เช่นเอกสารที่พูดถึง "refund" อาจได้น้ำหนักที่คำว่า "คืนเงิน" ติดมาด้วย ทั้งที่ไม่มีคำนั้นอยู่จริง

**จุดขาย:** ได้ความสามารถ semantic แต่ยัง**เก็บใน inverted index แบบเดิมได้** จึงค้นเร็วระดับ BM25 และยัง**อธิบายได้ว่า match เพราะคำไหน** (ต่างจาก dense vector ที่เป็นกล่องดำ 384 มิติ) — ข้อหลังนี้ตรงกับเป้าหมาย "เห็นกลไก" ของโปรเจกต์มาก

---

## ⚠️ ความเสี่ยง — ต้องเคลียร์ก่อนลงมือ

1. **SPLADE ส่วนใหญ่เป็น English-only** ตัว multilingual มีน้อยมาก และ ONNX build ที่ transformers.js รันได้ยิ่งหายาก — ถ้าหาไม่ได้ workshop นี้ทำไม่ได้เลย ต้องรู้ตั้งแต่ task แรก
2. **งานวิจัยปี 2026 เตือนตรงๆ ว่า "learned sparse ที่ไม่ train กับ domain ตัวเอง อาจแพ้ BM25 ธรรมดา"** — ต้องเตรียมใจว่าผลอาจออกมาแย่กว่า WS02 และนั่นก็เป็นผลลัพธ์ที่มีค่าถ้ารายงานตรงๆ

---

## W8-1 — Spike: หาโมเดล + ยืนยันว่าใช้กับไทยได้

**ทำ:** ก่อนแตะ schema ต้องยืนยันว่าโมเดลมีจริงและใช้ได้

- หา SPLADE/learned-sparse ที่มี ONNX + รองรับหลายภาษา
- ทดสอบ term expansion จริง: embed `business-logic/refund-policy.md` แล้วดูว่า**ได้น้ำหนักที่คำว่า "คืนเงิน" ติดมาไหม** ทั้งที่ไฟล์นั้นใช้คำว่า refund เป็นหลัก — นี่คือการทดสอบที่ตรงประเด็นที่สุด
- ดูว่า 1 เอกสารได้กี่ term ที่ไม่เป็นศูนย์ (sparsity) — ตัวเลขนี้กำหนดขนาด index ทั้งหมด

**DoD**
- [ ] จดชื่อโมเดล ขนาด และผลทดสอบ term expansion ภาษาไทยลง README
- [ ] จำนวน non-zero term ต่อเอกสาร (min/median/max)
- [ ] **ถ้าหาโมเดล multilingual ไม่ได้ → หยุดแล้วยกขึ้นมาคุย** อย่าฝืนใช้ตัว English-only แล้วสรุปว่า "SPLADE ไม่ดี"
- [ ] โมเดลที่รันผ่าน `@huggingface/transformers` เดิม → **อนุมัติล่วงหน้าแล้ว** โหลดได้เลย · npm package ตัวใหม่ → ต้องถามก่อน (ดู [นโยบาย dependency](README.md))

---

## W8-2 — Schema สำหรับ sparse vector

**ไฟล์:** `src/search/backends/sparse-schema.sql`

**ทำ:** เก็บ sparse vector เป็น inverted index ใน SQLite เดิม (ต่อยอดจาก WS02 ไม่สร้าง DB ใหม่)

```sql
-- (note_id, term, weight) + index ที่ term เพื่อ lookup แบบ inverted จริงๆ
CREATE TABLE sparse_terms (note_id TEXT, term TEXT, weight REAL, PRIMARY KEY (note_id, term));
CREATE INDEX idx_sparse_term ON sparse_terms(term);
```

**ต้องเทียบให้เห็น:** ขนาด index ของ SPLADE vs FTS5 (671,744 B) vs dense vector (350,208 B) — SPLADE มักใหญ่กว่า BM25 หลายเท่าเพราะ expansion เพิ่ม term ที่ไม่ได้มีอยู่จริง

**DoD**
- [ ] DDL อยู่ในไฟล์ `.sql` แยก มี comment ทุกตาราง (เหมือน WS02)
- [ ] ไม่ใช้ ORM
- [ ] มี threshold ตัด term ที่น้ำหนักต่ำทิ้ง (ไม่งั้น index บวมโดยไม่ช่วยอะไร) — ค่าที่ตัดต้องวัดผลกระทบ ไม่ใช่เดา

---

## W8-3 — `splade.backend.ts`

**ทำ:** query ก็ถูก expand เหมือนกัน แล้ว match กับ index ด้วย dot product ของ sparse vector

```
score(doc) = Σ (weight_query[term] × weight_doc[term])  สำหรับ term ที่ทั้งสองฝั่งมี
```

เขียน SQL ตรงๆ ให้เห็นว่าเป็นการ join บน term แล้วรวมน้ำหนัก — ไม่ใช่เวทมนตร์

**DoD**
- [ ] implement 3 method ครบ ไม่แก้ signature
- [ ] `matchedBy: "fts"` (ใช้ค่าที่มีอยู่ ไม่เพิ่มค่าใหม่เพราะ `core/` freeze แล้ว)
- [ ] สูตรคะแนนคำนวณตามด้วยมือได้
- [ ] **มี diagnostic บอกว่า match เพราะ term ไหน พร้อมน้ำหนัก** — นี่คือจุดขายหลักเทียบกับ dense vector ที่อธิบายไม่ได้

---

## W8-4 — วัดผล

**ต้องตอบให้ได้:**
- เทียบ **4 ทาง** บน query set เดิม: BM25 (WS02) / dense (WS03) / SPLADE / hybrid
- **`semantic` recall ขยับจาก 0.07 ขึ้นไปได้แค่ไหน** — นี่คือคำถามหลัก
- **`filtered` recall ที่ FTS5 ได้แค่ 0.80 เพราะตัดคำไทยไม่ได้ ดีขึ้นไหม**
- index size และ latency เทียบกับ FTS5

**DoD**
- [ ] ตาราง 4 ทาง แยกตาม query kind ครบทุกช่อง
- [ ] ยกเคสจริงที่ SPLADE เจอเอกสารที่ BM25 ไม่เจอ **พร้อมชี้ว่า expansion ไปโผล่ที่ term ไหน**
- [ ] มีเคสที่ SPLADE แพ้ BM25 ด้วย (ถ้ามี) — รายงานตรงๆ

---

## W8-5 — README

**DoD**
- [ ] ครบ 5 หัวข้อตาม CLAUDE.md §5
- [ ] ตอบให้ได้ว่า **"sparse ที่เรียนรู้มา" คุ้มกว่า "sparse สถิติ + dense แยกกัน" ไหม** ในบริบทนี้
- [ ] ถ้าผลออกมาแพ้ BM25 ให้เขียนตรงๆ พร้อมอธิบายว่าเป็นเพราะไม่ได้ train กับ domain นี้หรือเพราะอะไร
- [ ] `core/` ไม่ถูกแก้
