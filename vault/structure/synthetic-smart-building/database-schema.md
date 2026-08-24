---
layer: structure
tags: [smart-building, atrium, database, schema]
created: 2026-01-26
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-smart-building/module-hvac-controller]] ดูแล ได้แก่ `zone_setpoints` (ค่า setpoint ปัจจุบันต่อโซนพร้อม source ว่า auto หรือ manual), `zone_telemetry_latest` (ค่าอุณหภูมิ/ความชื้นล่าสุดที่ cache ไว้), และ `hvac_fault_log`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `zone_setpoints` | hvac-controller | อัปเดตทุกครั้งที่มี override หรือ auto adjustment |
| `occupancy_events` | occupancy-sensor-hub | เก็บ event occupied/vacant ทุกครั้ง ไม่ overwrite ของเก่า |
| `energy_recommendations` | energy-optimizer | คำแนะนำ setpoint ต่อโซนต่อรอบ 5 นาที |
| `door_events` | access-control-gateway | ประวัติการปัดบัตร/เปิดประตูทุกครั้ง เก็บถาวรเพื่อ audit |
| `work_orders` | maintenance-scheduler | สถานะงานซ่อมบำรุงทั้งหมด |

ทุกตารางใช้ `zone_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันแทน
