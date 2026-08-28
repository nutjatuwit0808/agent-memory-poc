---
layer: convention
tags: [review, quality]
created: 2025-12-16
links:
  - "[[support-cases/synthetic-subscription-billing/case-9086]]"
  - "[[support-cases/synthetic-subscription-billing/case-2383]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่มีผลกระทบทางการเงิน (proration, dunning retry, invoice) ต้องมี test ครอบคลุมกรณี idempotency และ concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-subscription-billing/case-9086]] และ [[support-cases/synthetic-subscription-billing/case-2383]])
