---
layer: business-logic
tags: [task, deadline, policy]
created: 2025-12-13
links:
  - "[[structure/synthetic-hr-onboarding/module-task-assignment]]"
  - "[[business-logic/synthetic-hr-onboarding/task-deadline-escalation-policy-edge-cases]]"
---

# นโยบาย Deadline และการ Escalate Task ที่เลยกำหนด

ทุก task จาก [[structure/synthetic-hr-onboarding/module-task-assignment]] มี deadline ตาม template ของ role นั้นๆ (ปกติ 1-5 วันทำการหลังสร้าง) task ที่เลยกำหนดจะถูก reassign ไปให้หัวหน้างานเห็นในรายงานประจำวันโดยอัตโนมัติผ่าน `reassignOverdueTasks`

task ที่เกี่ยวกับความปลอดภัย (เช่น เซ็น NDA) ไม่รอรอบ cron ปกติ — ถูก escalate ทันทีที่เลยกำหนดโดยไม่ต้องรอ batch job รายวัน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-hr-onboarding/task-deadline-escalation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
