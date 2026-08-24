---
layer: structure
tags: [requisition, module, core, reference, identifiers]
created: 2026-01-26
links:
  - "[[structure/synthetic-recruitment-ats/module-job-requisition-manager]]"
  - "[[business-logic/synthetic-recruitment-ats/requisition-approval-policy]]"
---

# job-requisition-manager — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด job-requisition-manager สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-recruitment-ats/module-job-requisition-manager]])

## Public functions
- `createRequisition(hiringManagerId: string, headcount: number, budget: BudgetInfo): Promise<string>` — สร้างคำขอเปิดตำแหน่งใหม่ คืน requisitionId
- `approveRequisition(requisitionId: string, approverId: string, level: ApprovalLevel): Promise<void>` — บันทึกการอนุมัติของ approver แต่ละระดับตามลำดับ
- `closeRequisition(requisitionId: string, reason: "filled" | "cancelled"): Promise<void>` — ปิดตำแหน่งเมื่อรับเข้าครบหรือยกเลิก
- `getOpenHeadcount(requisitionId: string): Promise<number>` — คำนวณจำนวนตำแหน่งที่ยังว่างจริงหลังหักผู้ที่กำลังจะปิด offer แล้ว

## Internal constants
- `MAX_APPROVAL_LEVELS = 3`
- `REQUISITION_STALE_DAYS = 45`

## Type

```ts
interface Requisition {
  requisitionId: string;
  status: "draft" | "pending_approval" | "approved" | "open" | "filled" | "cancelled";
  headcount: number;
  filledCount: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องลำดับการอนุมัติที่ [[business-logic/synthetic-recruitment-ats/requisition-approval-policy]]
