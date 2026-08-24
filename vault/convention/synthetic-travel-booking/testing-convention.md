---
layer: convention
tags: [testing, quality]
created: 2026-05-20
links:
  - "[[support-cases/synthetic-travel-booking/case-3613]]"
  - "[[support-cases/synthetic-travel-booking/case-1896]]"
---

# Testing Convention

## Concurrent test บังคับ

ฟังก์ชันที่แตะ inventory หรือ hold ต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ — บทเรียนจาก [[support-cases/synthetic-travel-booking/case-3613]] คือการขาด test แบบนี้ปล่อยให้ regression หลุดไปถึง production

## Timezone test

logic ที่แสดงเวลาข้าม timezone ต้องมี test case ที่ travelerTz กับ propertyTz ต่างกันชัดเจนเสมอ ตามบทเรียนจาก [[support-cases/synthetic-travel-booking/case-1896]]
