---
layer: structure
tags: [iot-fleet-tracker, trackgrid, database, schema]
created: 2026-05-31
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] ดูแล ได้แก่ `device_pings` (ping ดิบทุกตัวจากอุปกรณ์ เก็บแบบ append-only ไม่แก้ย้อนหลัง), `devices` (สถานะอุปกรณ์แต่ละตัว) และ `device_activation_log`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `device_pings` | gps-ingest | partition รายวันตาม timestamp เพราะปริมาณสูงมาก |
| `geofence_zones` | geofence-engine | นิยามขอบเขตโซนเป็น polygon |
| `geofence_events` | geofence-engine | event เข้า/ออกโซน อ้างอิง `device_pings` แบบ soft reference |
| `trips` | trip-aggregator | ทริปที่ประกอบเสร็จแล้ว ใช้คิดบิลลูกค้า |

ทุกตารางใช้ `device_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายคืนแทน
