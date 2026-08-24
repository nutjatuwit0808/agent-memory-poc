---
layer: structure
tags: [hr-onboarding, onboardflow, queue, async]
created: 2025-09-29
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
  - "[[structure/synthetic-hr-onboarding/module-task-assignment]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `document.signed`, `document.stuck`, `access.provisioned`, `access.provision_failed`, `compliance.overdue`, `task.completed` — [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] subscribe ทุก event เหล่านี้เพื่อตัดสินใจว่า case ไหนพร้อมขยับ stage ต่อ

[[structure/synthetic-hr-onboarding/module-task-assignment]] subscribe `document.signed` และ `access.provisioned` เพื่อ mark task ที่เกี่ยวข้องว่าเสร็จอัตโนมัติ โดยไม่ต้องรอให้ workflow-engine สั่งงานตรงๆ — ออกแบบแบบนี้เพื่อให้ checklist อัปเดตทันทีที่เหตุการณ์จริงเกิด ไม่ต้องรอ workflow-engine ประมวลผล stage ก่อน
