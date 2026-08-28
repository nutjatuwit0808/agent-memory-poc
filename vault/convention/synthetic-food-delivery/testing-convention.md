---
layer: convention
tags: [testing, integration]
created: 2026-03-18
links:
  - "[[support-cases/synthetic-food-delivery/case-4679]]"
  - "[[support-cases/synthetic-food-delivery/case-8986]]"
---

# Testing Convention

## Integration test สำหรับ concurrent scenarios

ฟังก์ชันที่แตะ order assignment หรือ driver state ต้องมี test จำลอง concurrent request อย่างน้อย 2 request พร้อมกัน — บทเรียนจาก [[support-cases/synthetic-food-delivery/case-4679]] คือ sequential test ไม่เจอ race condition

## Timezone test

ฟังก์ชันที่เกี่ยวกับ timestamp หรือ time window ต้องมี test ที่รันด้วย UTC+7 และ UTC timezone ที่ต่างกัน ดูบทเรียนจาก [[support-cases/synthetic-food-delivery/case-8986]]
