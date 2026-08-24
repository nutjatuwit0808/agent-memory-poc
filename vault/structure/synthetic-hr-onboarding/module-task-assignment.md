---
layer: structure
tags: [task, module]
created: 2026-07-06
links:
  - "[[structure/synthetic-hr-onboarding/module-document-collection]]"
  - "[[structure/synthetic-hr-onboarding/module-access-provisioning]]"
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
  - "[[business-logic/synthetic-hr-onboarding/task-duplication-prevention-policy]]"
---

# Module: task-assignment

สร้างและมอบหมาย checklist task ตาม role/department ของพนักงานใหม่ (เช่น "กรอกแบบฟอร์มภาษี", "อบรมความปลอดภัยข้อมูล") ให้ทั้งตัวพนักงานเอง, buddy, ทีม IT, และหัวหน้างาน แยกออกมาจาก onboarding-workflow-engine เพราะ template ของ task ต่าง role ต่าง department ซับซ้อนขึ้นเรื่อยๆ จนทำให้ workflow engine อ่านยาก

## ฟังก์ชันหลัก
- `generateTaskList(hireId: string, roleId: string): Promise<Task[]>` — สร้าง task ตาม template ของ role นั้นๆ ทันทีที่ case เริ่มต้น
- `assignTask(taskId: string, assigneeId: string): Promise<void>` — มอบหมาย task ให้ผู้รับผิดชอบ (พนักงานใหม่/buddy/IT/หัวหน้างาน)
- `completeTask(taskId: string): Promise<void>` — mark task ว่าเสร็จ ทั้งจากการกดยืนยันเองหรือจาก event ของ service อื่น
- `reassignOverdueTasks(): Promise<number>` — cron job รายวัน เลื่อน task ที่เลยกำหนดไปให้หัวหน้างานช่วยดูแทน คืนจำนวนที่ reassign

## State

pending → in_progress → done | overdue

## ความสัมพันธ์กับ module อื่น

subscribe event `document.signed` และ `access.provisioned` จาก [[structure/synthetic-hr-onboarding/module-document-collection]] และ [[structure/synthetic-hr-onboarding/module-access-provisioning]] เพื่อ auto-complete task ที่เกี่ยวข้อง โดยไม่ต้องพึ่ง [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] สั่งงานตรงๆ — ดู [[business-logic/synthetic-hr-onboarding/task-duplication-prevention-policy]] สำหรับปัญหา task ซ้ำที่เคยเกิด
