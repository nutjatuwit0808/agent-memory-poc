---
layer: structure
tags: [smart-building, atrium, boundaries]
created: 2025-10-11
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[structure/synthetic-smart-building/module-occupancy-sensor-hub]]"
  - "[[structure/synthetic-smart-building/module-energy-optimizer]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-smart-building/module-hvac-controller]] เป็นเจ้าของ setpoint และสถานะวาล์ว/damper ของทุกโซน ส่วน [[structure/synthetic-smart-building/module-occupancy-sensor-hub]] เป็นเจ้าของสถานะ occupied/vacant ดิบจาก sensor เท่านั้น ไม่รู้จัก setpoint หรือ comfort band เลย

[[structure/synthetic-smart-building/module-energy-optimizer]] ไม่มีสิทธิ์สั่งวาล์วหรือ damper โดยตรง — ทำได้แค่ publish "คำแนะนำ setpoint" ให้ [[structure/synthetic-smart-building/module-hvac-controller]] ตัดสินใจรับหรือไม่รับอีกที เหตุผลที่ออกแบบให้มีตัวกลางตัดสินใจสุดท้ายแค่จุดเดียวคือป้องกันไม่ให้สอง service แย่งกันสั่งฮาร์ดแวร์ตัวเดียวกันพร้อมกัน ซึ่งเป็นต้นเหตุของ oscillation ที่เคยเกิดขึ้นจริง
