---
layer: structure
tags: [asset-management, assettrack, queue, async]
created: 2026-07-08
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
  - "[[structure/synthetic-asset-management/module-depreciation-engine]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `asset.registered`, `asset.assigned`, `asset.returned`, `asset.flagged_for_disposal`, `procurement.approved`, `license.threshold_breached` — [[structure/synthetic-asset-management/module-asset-registry]] เป็น publisher หลักสำหรับ lifecycle event ของสินทรัพย์

[[structure/synthetic-asset-management/module-depreciation-engine]] subscribe `asset.registered` เพื่อสร้าง depreciation schedule อัตโนมัติเมื่อสินทรัพย์ใหม่เข้าระบบ โดยไม่ต้องรอให้ทีม finance trigger เองด้วยมือ ออกแบบแบบนี้เพื่อให้มั่นใจว่าทุกสินทรัพย์มี schedule ครบเสมอไม่มีตกหล่น
