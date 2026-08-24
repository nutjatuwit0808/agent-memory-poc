---
layer: structure
tags: [smart-building, atrium, queue, async]
created: 2025-12-10
links:
  - "[[structure/synthetic-smart-building/module-alert-dispatcher]]"
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[structure/synthetic-smart-building/module-occupancy-sensor-hub]]"
  - "[[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `occupancy.changed`, `setpoint.recommended`, `door.access_denied`, `sensor.fault_detected`, `hvac.deadband_exceeded` — [[structure/synthetic-smart-building/module-alert-dispatcher]] subscribe แทบทุก event เหล่านี้เพื่อจัดหมวดความรุนแรงแล้วส่งต่อ

[[structure/synthetic-smart-building/module-hvac-controller]] subscribe `occupancy.changed` จาก [[structure/synthetic-smart-building/module-occupancy-sensor-hub]] โดยตรงเพื่อปรับ comfort band ตามคนในห้อง (ห้องว่างใช้ setback แคบกว่า) แต่ไม่ subscribe `setpoint.recommended` แบบ auto-apply — ต้องผ่านการตัดสินใจภายในตัวเองอีกชั้นก่อนเสมอ ดู [[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]]
