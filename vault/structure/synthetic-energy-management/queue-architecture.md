---
layer: structure
tags: [energy-management, gridsync, queue, async]
created: 2026-04-25
links:
  - "[[structure/synthetic-energy-management/module-anomaly-detector]]"
  - "[[structure/synthetic-energy-management/module-demand-response-controller]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `meter.reading_received`, `demand.threshold_exceeded`, `equipment.schedule_conflict`, `meter.offline_detected`, `carbon.report_generated` — [[structure/synthetic-energy-management/module-anomaly-detector]] subscribe `meter.reading_received` ทุก event เพื่อตรวจจับความผิดปกติแบบ real-time

[[structure/synthetic-energy-management/module-demand-response-controller]] subscribe `demand.threshold_exceeded` แล้วตัดสินใจว่าจะสั่ง load shedding อุปกรณ์ไหนบ้างตามลำดับความสำคัญที่กำหนดไว้ล่วงหน้า
