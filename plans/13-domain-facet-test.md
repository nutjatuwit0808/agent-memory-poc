# ส่วนขยาย — วัดผลจริงว่า domain filter ช่วย recall ได้แค่ไหน

> **ต้องทำ [plans/12-domain-facet.md](12-domain-facet.md) ให้เสร็จก่อน** — แผนนี้วัดผลของ facet ที่ 12 สร้างไว้ ไม่มี domain field ให้ filter เลยถ้ายังไม่ implement

## คำถามตั้งต้น

domain filter (จาก plan 12) กู้ recall ของ vector กลับมาได้จริงแค่ไหนที่ scale 1,945 ไฟล์ — ถ้า filter ทำงานถูกจริง ในทางทฤษฎี candidate pool ของ query ที่ระบุ `domain="core"` ควรเหลือแค่ 55 ไฟล์เท่ากับตอนวัด baseline ครั้งแรก ดังนั้น **recall ควรกลับไปเท่ากับตัวเลขที่ 55 ไฟล์เป๊ะ** (0.78 สำหรับ vector) — ถ้าไม่เท่าคือมีจุดผิดพลาดใน implementation ที่ต้องตามหา

## บริบท

ตัวเลข baseline ที่มีอยู่แล้ว (ไม่ต้องวัดซ้ำ):

| backend | recall@5 @ 55 ไฟล์ (candidate pool เล็ก) | recall@5 @ 1,945 ไฟล์ ไม่มี filter (candidate pool เต็ม) |
|---|---|---|
| vector | 0.78 | 0.53 |
| router-route | ~0.845 | 0.65 |
| router-fuse | ~0.925 | 0.81 |
| fts5 | 0.72 | 0.67 |
| ripgrep | 0.74 | 0.62 |

สมมติฐาน: **vector ควรได้ประโยชน์มากสุด** (gap ใหญ่สุด 0.78→0.53) เพราะปัญหาคือ semantic collision ล้วนๆ · **fts5 ควรได้ประโยชน์น้อยสุด** เพราะ recall แทบไม่ตกอยู่แล้ว (exact/keyword match ไม่สนใจ noise)

## Decision points

| เรื่อง | ทางที่เลือก | เหตุผล |
|---|---|---|
| **query set ที่ใช้ทดสอบ** | ใช้ `bench/queries.json` เดิม 25 ข้อ (ทั้งหมดเป็น PayFlow) ส่ง `domain="core"` เข้าไปทุก query | ไม่ต้องสร้าง ground truth ใหม่ — รู้อยู่แล้วว่าทุก query ใน ground truth เดิมตอบด้วยไฟล์ใน `domain="core"` เท่านั้น |
| **แก้ `bench.ts` ยังไง** | เพิ่ม flag `--domain-filter` ที่ inject `domain: "core"` เข้า `SearchQuery` ของทุก query ก่อนยิง ไม่แก้ `queries.json` เอง | รักษา ground truth เดิมไว้ไม่แตะ เทียบ "filter vs ไม่ filter" ด้วย script เดียวกันได้ทันที |
| **ทดสอบ synthetic domain queries ด้วยไหม (bonus)** | ทำถ้ามีเวลา — สร้าง mini ground truth 6-10 ข้อจาก 2-3 domain ที่เคยทดสอบเชิงคุณภาพผ่าน Cursor แล้ว (warehouse-robotics, health-records) เพราะรู้คำตอบที่ถูกต้องอยู่แล้วจากตอนยืนยันด้วย grep | ปิด blind spot — ตอนนี้มีแต่หลักฐานว่า domain filter ช่วย PayFlow query ยังไม่เคยวัดว่าช่วย query ของ domain สังเคราะห์เองด้วยหรือเปล่า |

## Task breakdown

- [ ] **T1** แก้ `src/cli/bench.ts` เพิ่ม flag `--domain-filter=<value>` ที่ inject `domain` เข้า `SearchQuery` ของทุก query ก่อนยิงไปแต่ละ backend — DoD: `npm run bench -- --domain-filter=core` รันได้โดยไม่แก้ `bench/queries.json`
- [ ] **T2** รัน `npm run bench -- --domain-filter=core` ที่ vault 1,945 ไฟล์ — บันทึกตาราง recall@5/p50 เทียบกับตัวเลขที่มีอยู่แล้ว (ไม่มี filter @ 1,945 ไฟล์) และ baseline (@ 55 ไฟล์)
- [ ] **T3** วิเคราะห์ผล — ตรวจสอบสมมติฐาน 3 ข้อ: (a) recall กลับไปเท่า baseline 55 ไฟล์เป๊ะหรือไม่ (ถ้าไม่เท่า หาสาเหตุ) (b) vector ได้ประโยชน์มากสุดจริงไหม (c) latency เปลี่ยนไปยังไง (candidate pool เล็กลง 35 เท่า ควรเร็วขึ้นด้วย ไม่ใช่แค่แม่นขึ้น)
- [ ] **T4 (bonus)** สร้าง mini ground truth 6-10 query จาก 2-3 synthetic domain (อ้างอิงไฟล์คำตอบที่ยืนยันด้วย grep ไว้แล้วตอนทดสอบผ่าน Cursor) — รัน bench เทียบ `domain="warehouse-robotics"` (filter) vs ไม่ filter ว่า synthetic domain เองก็ได้ประโยชน์เหมือนกันไหม
- [ ] **T5** บันทึกผลลง `CHECKLIST.md` และอัปเดต README หัวข้อ 7 — สรุปว่า domain filter คุ้มไหม พร้อม trade-off ที่ยังเหลืออยู่ (เช่น query ที่ agent ไม่รู้ domain ล่วงหน้ายังต้อง full-scope search เหมือนเดิม ไม่ได้ประโยชน์จาก filter นี้เลย)

## Gate

ตอบได้ด้วยตัวเลขจริงว่า domain filter กู้ recall ได้แค่ไหน (ไม่ใช่แค่ "ควรจะช่วย" ตามทฤษฎี) และรู้ขอบเขตที่ filter นี้ช่วยไม่ได้ (query ที่ไม่รู้ domain ล่วงหน้า) — ถ้า T1-T3 ทำครบและตัวเลขตรงกับสมมติฐาน (recall กลับไปใกล้เคียง 55-ไฟล์ baseline) ถือว่า domain facet (plan 12) พิสูจน์ตัวเองแล้วว่าคุ้มค่ากับการแก้ `core/`
