---
layer: structure
tags: [customer-segmentation, segmentiq, queue, async]
created: 2026-02-11
links:
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
  - "[[structure/synthetic-customer-segmentation/module-health-monitor]]"
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `event.ingested`, `segment.definition_updated`, `membership.refresh_completed`, `export.completed`, `export.failed` — [[structure/synthetic-customer-segmentation/module-membership-refresher]] subscribe `segment.definition_updated` เพื่อ trigger refresh ทันทีเมื่อ definition เปลี่ยน

[[structure/synthetic-customer-segmentation/module-health-monitor]] subscribe `membership.refresh_completed` เพื่อคำนวณ health score ทันทีหลัง refresh เสร็จ โดยไม่ต้องรัน schedule แยก ออกแบบแบบนี้เพื่อให้ health score ล่าสุดพร้อมก่อนที่ [[structure/synthetic-customer-segmentation/module-channel-exporter]] จะ export ในรอบถัดไปเสมอ
