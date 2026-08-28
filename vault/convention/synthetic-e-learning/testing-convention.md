---
layer: convention
tags: [testing, security]
created: 2025-11-26
links:
  - "[[support-cases/synthetic-e-learning/case-8009]]"
  - "[[support-cases/synthetic-e-learning/case-1457]]"
---

# Testing Convention

## Concurrent test requirement

ฟังก์ชันที่แตะ enrollment หรือ certificate issuance ต้องมี test จำลอง concurrent request อย่างน้อย 2 ตัวเพื่อตรวจ race condition บทเรียนจาก [[support-cases/synthetic-e-learning/case-8009]] และ [[support-cases/synthetic-e-learning/case-1457]]

## Security test requirement

Assessment endpoint ต้องมี security test ที่ตรวจว่า (1) ไม่มี correct answer ใน response (2) timer enforce ฝั่ง server (3) cooldown บังคับจริง — test เหล่านี้ต้องรันทุก CI build ไม่ใช่แค่ audit รายปี
