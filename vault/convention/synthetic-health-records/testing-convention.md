---
layer: convention
tags: [testing, quality]
created: 2026-07-30
links:
  - "[[support-cases/synthetic-health-records/case-3762]]"
---

# Testing Convention

## Concurrent test

ฟังก์ชันที่แก้ข้อมูลผู้ป่วยหรือจองนัดหมายต้องมี test จำลอง concurrent call อย่างน้อย 2 ตัวเสมอ — บทเรียนจาก [[support-cases/synthetic-health-records/case-3762]]

## Access control test

ทุก endpoint ที่แตะข้อมูลผู้ป่วยต้องมี test ยืนยันว่าปฏิเสธการเข้าถึงที่ไม่มี care relationship ครบทุกเส้นทาง ไม่ใช่แค่เส้นทางหลัก
