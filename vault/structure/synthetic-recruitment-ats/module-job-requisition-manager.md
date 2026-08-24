---
layer: structure
tags: [requisition, module, core]
created: 2025-09-04
links:
  - "[[business-logic/synthetic-recruitment-ats/requisition-approval-policy]]"
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
  - "[[structure/synthetic-recruitment-ats/service-boundaries]]"
---

# Module: job-requisition-manager

จัดการวงจรชีวิตของตำแหน่งงานตั้งแต่เปิดขอ approve จนถึงปิดตำแหน่ง แยกออกมาจาก candidate-pipeline-tracker ตั้งแต่กลางปี 2025 เพราะ logic การอนุมัติ headcount (multi-level approval, budget check) ซับซ้อนขึ้นเรื่อยๆ จนปนกับ logic การติดตามผู้สมัครแล้วทดสอบยาก

## ฟังก์ชันหลัก
- `createRequisition(hiringManagerId: string, headcount: number, budget: BudgetInfo): Promise<string>` — สร้างคำขอเปิดตำแหน่งใหม่ คืน requisitionId
- `approveRequisition(requisitionId: string, approverId: string, level: ApprovalLevel): Promise<void>` — บันทึกการอนุมัติของ approver แต่ละระดับตามลำดับ
- `closeRequisition(requisitionId: string, reason: "filled" | "cancelled"): Promise<void>` — ปิดตำแหน่งเมื่อรับเข้าครบหรือยกเลิก
- `getOpenHeadcount(requisitionId: string): Promise<number>` — คำนวณจำนวนตำแหน่งที่ยังว่างจริงหลังหักผู้ที่กำลังจะปิด offer แล้ว

## State

draft → pending_approval → approved → open → filled | cancelled — ดู [[business-logic/synthetic-recruitment-ats/requisition-approval-policy]] สำหรับลำดับการอนุมัติ

## ความสัมพันธ์กับ module อื่น

`getOpenHeadcount` เป็นฟังก์ชันเดียวที่ query ข้าม [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]] โดยตรง (ข้อยกเว้นที่ตั้งใจ ดู [[structure/synthetic-recruitment-ats/service-boundaries]]) เพื่อไม่ให้ headcount ถูก overcommit ระหว่างที่มีหลาย offer กำลังรออนุมัติพร้อมกัน
