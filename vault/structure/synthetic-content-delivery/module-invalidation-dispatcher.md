---
layer: structure
tags: [invalidation, module, core]
created: 2026-05-10
links:
  - "[[business-logic/synthetic-content-delivery/invalidation-propagation-policy]]"
  - "[[structure/synthetic-content-delivery/module-cache-coordinator]]"
  - "[[support-cases/synthetic-content-delivery/case-1288]]"
---

# Module: invalidation-dispatcher

รับ invalidation request จาก tenant และ propagate ไปยัง edge node ทุกจุดที่มี cache ของ content นั้น ความท้าทายหลักคือต้องยืนยันว่า edge node ทุกตัว acknowledge การ invalidation ก่อนถือว่าเสร็จสมบูรณ์ เพราะถ้า edge บางจุด miss ก็จะยังคง serve เนื้อหาเก่าต่อไป แยกออกมาเป็น service ต่างหากเพราะ propagation logic ซับซ้อนและต้องการ retry/acknowledgment ที่ไม่ปะปนกับ logic cache lookup

## ฟังก์ชันหลัก
- `dispatchInvalidation(tenantId: string, pattern: string): Promise<InvalidationJob>` — สร้าง invalidation job และส่งไปยัง edge node ทุกจุด คืน job ID สำหรับ tracking
- `checkPropagationStatus(jobId: string): Promise<PropagationStatus>` — ตรวจสอบว่า edge node แต่ละจุด acknowledge แล้วหรือยัง
- `retryFailedNodes(jobId: string): Promise<void>` — ส่ง invalidation ซ้ำให้ edge node ที่ยังไม่ acknowledge ตาม [[business-logic/synthetic-content-delivery/invalidation-propagation-policy]]
- `cancelInvalidation(jobId: string, reason: string): Promise<void>` — ยกเลิก invalidation job ที่ stuck โดยต้องมีผู้ดูแลระบบสั่ง

## State

queued → propagating → partial_acknowledged → fully_acknowledged | timed_out — ดู [[business-logic/synthetic-content-delivery/invalidation-propagation-policy]] สำหรับเกณฑ์ timeout

## ความสัมพันธ์กับ module อื่น

เรียก `markStale` ใน [[structure/synthetic-content-delivery/module-cache-coordinator]] สำหรับ content key ที่ match pattern ก่อนส่งไป edge node เพื่อให้ request ที่เข้ามาระหว่าง propagation ยัง revalidate จาก origin แทนที่จะเสิร์ฟเนื้อหาเก่า ดู [[support-cases/synthetic-content-delivery/case-1288]] สำหรับเคสที่เกิดขึ้นจริงเมื่อขาดขั้นตอนนี้
