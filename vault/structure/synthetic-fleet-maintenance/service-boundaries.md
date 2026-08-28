---
layer: structure
tags: [fleet-maintenance, wrenchhub, boundaries]
created: 2025-11-08
links:
  - "[[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]"
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
  - "[[structure/synthetic-fleet-maintenance/module-downtime-tracker]]"
  - "[[structure/synthetic-fleet-maintenance/module-inspection-recorder]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]] เป็นเจ้าของตารางนัดบำรุงรักษาทั้งหมด ส่วน [[structure/synthetic-fleet-maintenance/module-work-order-manager]] เป็นเจ้าของ work order และไม่รู้ schedule detail ของ scheduler โดยตรง

[[structure/synthetic-fleet-maintenance/module-downtime-tracker]] เป็น service เดียวที่เชื่อมข้อมูลจาก [[structure/synthetic-fleet-maintenance/module-work-order-manager]] และ [[structure/synthetic-fleet-maintenance/module-inspection-recorder]] เข้าด้วยกันเพื่อคำนวณ downtime จริง เหตุผลที่รวมการคำนวณไว้ที่จุดเดียวเพื่อให้ตัวเลขที่รายงานต่อ management มีแหล่งที่มาเดียวกันเสมอ
