---
layer: structure
tags: [quality-control, qualitypulse, queue, async]
created: 2025-12-20
links:
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
  - "[[structure/synthetic-quality-control/module-quarantine-manager]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `measurement.received`, `spc.violation_detected`, `batch.rejected`, `batch.quarantined`, `rework.approved`, `certification.issued` — [[structure/synthetic-quality-control/module-batch-inspector]] เป็นทั้งผู้ publish และ subscribe เพราะต้อง react ต่อผล SPC แล้ว trigger กระบวนการถัดไปเอง

[[structure/synthetic-quality-control/module-quarantine-manager]] subscribe `batch.rejected` เพื่อสร้าง hold อัตโนมัติ โดยไม่ต้องรอให้ batch-inspector สั่งตรงๆ ออกแบบแบบนี้เพื่อให้การ quarantine ทำงานได้แม้ batch-inspector จะล่มชั่วคราว
