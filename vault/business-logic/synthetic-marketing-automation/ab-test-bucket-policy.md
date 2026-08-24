---
layer: business-logic
tags: [ab-test, policy]
created: 2026-05-27
links:
  - "[[business-logic/synthetic-marketing-automation/ab-test-bucket-policy-edge-cases]]"
---

# นโยบายการแบ่ง Bucket สำหรับ A/B Test

campaign ที่เปิด A/B test ต้องแบ่งผู้รับเข้า bucket ด้วย deterministic hash ของ `contactId` เสมอ ไม่ใช่การสุ่มแบบ non-deterministic ทุกครั้งที่รัน เพื่อให้ contact คนเดียวกันอยู่ bucket เดิมเสมอถ้า campaign เดียวกันถูกส่งซ้ำบางส่วน (เช่น retry หลัง pause)

ขนาด bucket ต้องต่างกันไม่เกิน 2% ของกันและกันเสมอ ถ้าการแบ่งจริงเบี่ยงเบนเกินนี้ ระบบจะ flag ให้ทีม marketing ตรวจสอบก่อนอ่านผลลัพธ์ เพราะผลที่ได้อาจไม่น่าเชื่อถือทางสถิติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-marketing-automation/ab-test-bucket-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
