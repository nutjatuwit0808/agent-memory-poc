---
layer: structure
tags: [energy-management, gridsync, database, schema]
created: 2025-11-28
links:
  - "[[structure/synthetic-energy-management/module-meter-collector]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-energy-management/module-meter-collector]] ดูแล ได้แก่ `meter_readings` (time-series), `meter_registry`, และ `meter_health_status`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `meter_readings` | meter-collector | time-series เก็บทุกจุดข้อมูลดิบ ไม่ aggregate ล่วงหน้า |
| `demand_events` | demand-response-controller | เก็บทุกครั้งที่ trigger demand response |
| `equipment_schedules` | equipment-scheduler | ไม่มี FK ตรงไป meter_readings ใช้ facilityId แบบ soft reference |
| `carbon_reports` | carbon-calculator | เก็บผลคำนวณรายเดือน ไม่เก็บ raw reading ซ้ำ |

ไม่มี FK ข้ามระบบจริงเพราะแยก database กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก demand_event มี meterId ที่มีอยู่จริง)
