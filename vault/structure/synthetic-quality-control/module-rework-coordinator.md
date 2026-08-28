---
layer: structure
tags: [rework, module]
created: 2025-09-02
links:
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
  - "[[business-logic/synthetic-quality-control/rework-approval-authority-policy]]"
---

# Module: rework-coordinator

ประสานกระบวนการ rework ของ batch ที่ถูก reject จัดสรรทรัพยากรในสายรื้องาน บันทึกขั้นตอนและผู้รับผิดชอบแต่ละขั้นตอน แล้วส่งผลการ rework กลับให้ [[structure/synthetic-quality-control/module-batch-inspector]] ตรวจซ้ำ ออกแบบให้แยกจาก batch-inspector เพราะ workflow rework มีรายละเอียดขั้นตอนของตัวเองที่เปลี่ยนบ่อยตามประเภทผลิตภัณฑ์

## ฟังก์ชันหลัก
- `openReworkTicket(batchId: string, violationIds: string[]): Promise<ReworkTicketId>` — เปิด ticket rework พร้อมระบุ violation ที่ต้องแก้
- `assignReworkLine(ticketId: string, lineId: string, technicianId: string): Promise<void>` — มอบหมาย batch ให้สายรื้องานและช่างที่รับผิดชอบ
- `completeReworkStep(ticketId: string, stepId: string, outcome: StepOutcome): Promise<void>` — บันทึกผลของแต่ละขั้นตอนในกระบวนการ rework
- `submitReworkForInspection(ticketId: string): Promise<void>` — ส่ง batch ที่ rework แล้วกลับให้ batch-inspector ตรวจซ้ำ

## State

open → assigned → in_rework → awaiting_inspection → closed_pass | closed_fail — ดู [[business-logic/synthetic-quality-control/rework-approval-authority-policy]] สำหรับว่าใครต้องอนุมัติแต่ละ transition

## ความสัมพันธ์กับ module อื่น

ไม่มีสิทธิ์ผ่าน batch เอง — หลัง rework เสร็จต้องส่งกลับให้ [[structure/synthetic-quality-control/module-batch-inspector]] ตัดสินใจซ้ำเสมอ เพื่อให้มีหลักฐาน audit trail ว่า batch ผ่านการตรวจอีกรอบจริง
