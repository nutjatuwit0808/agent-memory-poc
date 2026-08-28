---
layer: convention
tags: [testing, integration]
created: 2026-05-04
links:
  - "[[support-cases/synthetic-content-delivery/case-2324]]"
---

# Testing Convention

## Integration test ที่บังคับ

ฟังก์ชันที่แตะ propagation logic ต้องมี test จำลอง edge node offline บางส่วนระหว่าง propagation เสมอ เพื่อตรวจสอบว่า retry และ timeout ทำงานถูกต้อง — บทเรียนจาก [[support-cases/synthetic-content-delivery/case-2324]]

## Security test

ทุก PR ที่แก้ geo-restriction logic ต้องรัน geo-bypass test suite ที่ครอบคลุม edge node whitelist scenario ด้วย ก่อน merge เสมอ
