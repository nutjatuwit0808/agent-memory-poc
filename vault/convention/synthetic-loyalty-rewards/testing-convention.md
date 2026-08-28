---
layer: convention
tags: [testing, quality]
created: 2025-10-29
links:
  - "[[support-cases/synthetic-loyalty-rewards/case-3333]]"
---

# Testing Convention

## Idempotency test บังคับ

ฟังก์ชัน credit และ redemption ทุกตัวต้องมี test ยิง request เดิมสองครั้งและยืนยันว่าผลลัพธ์เหมือนกัน บทเรียนจาก [[support-cases/synthetic-loyalty-rewards/case-3333]]

## Concurrent test

ฟังก์ชันที่แตะ balance lock ต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัว เพื่อตรวจ race condition
