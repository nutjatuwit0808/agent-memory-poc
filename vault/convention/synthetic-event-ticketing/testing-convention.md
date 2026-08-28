---
layer: convention
tags: [testing, quality]
created: 2026-04-21
links:
  - "[[support-cases/synthetic-event-ticketing/case-1330]]"
  - "[[support-cases/synthetic-event-ticketing/case-6691]]"
---

# Testing Convention

## Concurrent test

ฟังก์ชันที่แก้สถานะที่นั่งหรือการสแกนต้องมี test จำลอง concurrent call อย่างน้อย 2 ตัวเสมอ — บทเรียนจาก [[support-cases/synthetic-event-ticketing/case-1330]]

## Timezone test

ฟังก์ชันที่คำนวณ deadline ที่ผู้ใช้เห็นต้องมี test เทียบข้าม timezone เสมอ — บทเรียนจาก [[support-cases/synthetic-event-ticketing/case-6691]]
