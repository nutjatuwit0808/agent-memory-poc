---
layer: convention
tags: [testing, simulation]
created: 2026-06-30
links:
  - "[[support-cases/synthetic-warehouse-robotics/case-2528]]"
---

# Testing Convention

## Simulation ก่อนขึ้นจริง

logic ที่กระทบการเคลื่อนไหวจริงของหุ่นยนต์ต้องผ่าน simulation test ครบทุก zone assignment ก่อน merge เสมอ — บทเรียนจาก [[support-cases/synthetic-warehouse-robotics/case-2528]] คือ simulation ที่ไม่ครอบคลุม config จริงเจอ bug ไม่ทัน

## Concurrent test

ฟังก์ชันที่แตะ task assignment ต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ
