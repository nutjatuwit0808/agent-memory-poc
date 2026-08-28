---
layer: structure
tags: [fleet-maintenance, wrenchhub, queue, async]
created: 2025-09-25
links:
  - "[[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]"
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
  - "[[structure/synthetic-fleet-maintenance/module-reorder-trigger]]"
  - "[[structure/synthetic-fleet-maintenance/module-parts-inventory]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `maintenance.due`, `workorder.opened`, `workorder.closed`, `parts.consumed`, `vehicle.breakdown`, `stock.below_reorder_point` — [[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]] publish `maintenance.due` และ [[structure/synthetic-fleet-maintenance/module-work-order-manager]] subscribe เพื่อสร้าง work order อัตโนมัติ

[[structure/synthetic-fleet-maintenance/module-reorder-trigger]] subscribe `stock.below_reorder_point` จาก [[structure/synthetic-fleet-maintenance/module-parts-inventory]] โดยตรง ออกแบบแบบนี้เพื่อให้การสั่งอะไหล่ทำงานได้แม้ work-order-manager จะล่มชั่วคราว เพราะ inventory ต้อง replenish ได้โดยอิสระ
