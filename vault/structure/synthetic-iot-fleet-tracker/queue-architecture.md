---
layer: structure
tags: [iot-fleet-tracker, trackgrid, queue, async]
created: 2026-08-01
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `ping.received`, `geofence.entered`, `geofence.exited`, `device.offline`, `trip.completed` — [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]] subscribe `ping.received` แล้ว evaluate ว่า ping ล่าสุดอยู่ในโซนไหนก่อนจะ publish event ของตัวเอง

[[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]] subscribe เกือบทุก event ประเภทข้างต้นเพราะต้องตัดสินใจว่าเหตุการณ์ไหนควรแจ้งเตือนลูกค้าทันที ออกแบบให้เป็น subscriber ปลายทางเสมอ ไม่ publish event กลับเข้า queue หลัก เพื่อไม่ให้เกิด event loop
