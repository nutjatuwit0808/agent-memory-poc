---
layer: business-logic
tags: [send, dedup, policy]
created: 2026-04-14
links:
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[business-logic/synthetic-marketing-automation/duplicate-send-prevention-policy-edge-cases]]"
---

# นโยบายป้องกันการส่งซ้ำ

[[structure/synthetic-marketing-automation/module-send-scheduler]] ต้องเช็ค idempotency key (`campaignId` + `contactId` + `batchIndex`) ก่อนส่งจริงทุกครั้ง — ถ้าเคยส่งสำเร็จให้ contact คนนี้ใน batch นี้แล้ว จะข้ามทันทีแม้ `dispatchNextBatch` จะถูกเรียกซ้ำจากเหตุผลใดก็ตาม

การเช็ค idempotency ทำที่ database layer ด้วย unique constraint ไม่ใช่แค่ใน application layer เท่านั้น เพื่อกัน race condition เมื่อมี worker หลายตัวประมวลผล batch เดียวกันพร้อมกัน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-marketing-automation/duplicate-send-prevention-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
