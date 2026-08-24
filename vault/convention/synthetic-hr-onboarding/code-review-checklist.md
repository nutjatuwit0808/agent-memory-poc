---
layer: convention
tags: [review, quality]
created: 2026-08-17
links:
  - "[[support-cases/synthetic-hr-onboarding/case-5546]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

event consumer ทุกตัวต้องมี idempotency check ก่อน merge เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-hr-onboarding/case-5546]]) และ handler ของ webhook จาก vendor ภายนอกต้องมี default case สำหรับ event ประเภทที่ไม่รู้จัก ไม่ใช่ทิ้งเงียบๆ
