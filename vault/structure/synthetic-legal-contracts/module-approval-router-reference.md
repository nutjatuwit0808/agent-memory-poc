---
layer: structure
tags: [approval, module, core, reference, identifiers]
created: 2026-01-30
links:
  - "[[structure/synthetic-legal-contracts/module-approval-router]]"
  - "[[business-logic/synthetic-legal-contracts/approval-chain-by-value-policy]]"
---

# approval-router — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด approval-router สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-legal-contracts/module-approval-router]])

## Public functions
- `computeApprovalChain(contractId: string, value: number, type: string): Promise<ApprovalStep[]>` — คำนวณลำดับผู้อนุมัติตามมูลค่าและประเภทสัญญา
- `recordApproval(contractId: string, approverId: string, step: number): Promise<ApprovalStatus>` — บันทึกการอนุมัติของขั้นตอนหนึ่ง คืนสถานะรวมล่าสุด
- `isFullyApproved(contractId: string): Promise<boolean>` — ตรวจว่าสัญญาผ่านทุกขั้นตอนอนุมัติแล้วหรือยัง

## Internal constants
- `APPROVAL_TIER_1_MAX_VALUE_THB = 500000`
- `APPROVAL_TIER_2_MAX_VALUE_THB = 5000000`

## Type

```ts
interface ApprovalStep {
  stepIndex: number;
  approverRole: string;
  status: "pending" | "approved" | "rejected";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เต็มที่ [[business-logic/synthetic-legal-contracts/approval-chain-by-value-policy]]
