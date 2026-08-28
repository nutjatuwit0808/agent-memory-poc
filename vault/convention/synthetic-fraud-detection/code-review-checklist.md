---
layer: convention
tags: [review, quality]
created: 2026-08-04
links:
  - "[[support-cases/synthetic-fraud-detection/case-4887]]"
  - "[[support-cases/synthetic-fraud-detection/case-7261]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แตะ fraud decision (block/allow) ต้องมี idempotency check เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-fraud-detection/case-4887]]) และ comparison กับ threshold ที่เป็น float ต้องใช้ explicit float comparison ไม่ใช่ integer (ดูบทเรียนจาก [[support-cases/synthetic-fraud-detection/case-7261]])
