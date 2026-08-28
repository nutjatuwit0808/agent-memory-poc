---
layer: convention
tags: [testing, integration]
created: 2026-08-15
links:
  - "[[support-cases/synthetic-fraud-detection/case-4887]]"
  - "[[support-cases/synthetic-fraud-detection/case-7261]]"
---

# Testing Convention

## Idempotency test

ฟังก์ชันที่ process event ต้องมี test ที่ส่ง event เดียวกัน 2 ครั้งและ verify ว่าผลลัพธ์เหมือนกับส่งครั้งเดียว (ดูบทเรียนจาก [[support-cases/synthetic-fraud-detection/case-4887]])

## Boundary value test

ทุก threshold comparison เช่น score ≥ 80, score < 60 ต้องมี test กับ boundary value รวมถึง 79.999, 80.0, 80.001 เพื่อจับ floating point edge case (ดู [[support-cases/synthetic-fraud-detection/case-7261]])
