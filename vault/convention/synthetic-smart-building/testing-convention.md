---
layer: convention
tags: [testing, simulation]
created: 2026-05-18
links:
  - "[[support-cases/synthetic-smart-building/case-7700]]"
  - "[[support-cases/synthetic-smart-building/case-6336]]"
---

# Testing Convention

## Simulation ก่อนขึ้นจริง

logic ที่กระทบ access-control หรือ fire safety ต้องผ่าน simulation test ครบทุก schedule type ก่อน merge เสมอ — บทเรียนจาก [[support-cases/synthetic-smart-building/case-7700]] คือ schedule type ใหม่ที่ไม่ได้ทดสอบร่วมกับ emergency egress flag เจอ bug ไม่ทัน

## Concurrent test

ฟังก์ชันที่แตะ work order dedup ต้องมี test จำลอง event ซ้ำที่ casing ต่างกันเสมอ ตามบทเรียนจาก [[support-cases/synthetic-smart-building/case-6336]]
