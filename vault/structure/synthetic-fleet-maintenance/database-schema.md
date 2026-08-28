---
layer: structure
tags: [fleet-maintenance, wrenchhub, database, schema]
created: 2025-10-06
links:
  - "[[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]] ดูแล ได้แก่ `vehicles` (ทะเบียนและ odometer ปัจจุบัน), `maintenance_schedules` (กำหนดการบำรุงตามระยะทาง/เวลา), และ `maintenance_triggers`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `vehicles` | maintenance-scheduler | odometer อัปเดตทุกครั้งที่รถกลับอู่ |
| `work_orders` | work-order-manager | สถานะ open/in-progress/closed |
| `parts_stock` | parts-inventory | ปริมาณปัจจุบันและ reorder point |
| `inspection_records` | inspection-recorder | ผลตรวจแต่ละครั้ง linked กับ vehicle_id |
| `downtime_events` | downtime-tracker | start/end timestamp พร้อม cause code |

ทุกตารางใช้ `vehicle_id` เป็น foreign key ร่วมกันแบบ soft reference ไม่มี FK constraint ข้าม database จริง ตรวจสอบความสอดคล้องด้วย reconciliation job รายสัปดาห์
