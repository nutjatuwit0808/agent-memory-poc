---
layer: business-logic
tags: [invalidation, propagation, policy]
created: 2026-03-05
links:
  - "[[structure/synthetic-content-delivery/module-invalidation-dispatcher]]"
  - "[[business-logic/synthetic-content-delivery/origin-retry-policy]]"
  - "[[support-cases/synthetic-content-delivery/case-8309]]"
  - "[[business-logic/synthetic-content-delivery/invalidation-propagation-policy-edge-cases]]"
---

# นโยบาย Propagation Timeout ของ Cache Invalidation

เมื่อ tenant ส่ง invalidation request เข้ามา [[structure/synthetic-content-delivery/module-invalidation-dispatcher]] ต้องส่ง signal ไปยัง edge node ทุกจุดและรอ acknowledgment — ถ้า edge node ใดไม่ตอบสนองภายใน `PROPAGATION_TIMEOUT_SECONDS` จะ retry ตาม [[business-logic/synthetic-content-delivery/origin-retry-policy]] สูงสุด `MAX_PROPAGATION_RETRY_ATTEMPTS` รอบ

ถ้าหมด retry แล้ว edge node นั้นยังไม่ acknowledge invalidation job จะถูก mark เป็น `timed_out` และ escalate ให้ทีม on-call ตรวจสอบ edge node นั้นด้วยมือ ไม่ถือว่า invalidation สำเร็จ 100% เพราะ edge นั้นอาจยังเสิร์ฟเนื้อหาเก่า

## Thundering herd บน invalidation queue

ถ้า tenant ส่ง invalidation สำหรับ wildcard pattern ที่ match content จำนวนมากพร้อมกัน (เช่น `*` หรือ `/videos/*`) invalidation dispatcher จะ batch ส่งไปที่ละ edge node ไม่เกิน 1,000 รายการต่อรอบ เพื่อไม่ให้ edge node ถูก flood จาก invalidation แทนที่จะเป็น request ของผู้ใช้จริง ดู [[support-cases/synthetic-content-delivery/case-8309]] สำหรับกรณีที่เกิดขึ้นจริง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-content-delivery/invalidation-propagation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
