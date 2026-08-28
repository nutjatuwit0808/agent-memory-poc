---
layer: structure
tags: [approval, module, core]
created: 2026-05-18
links:
  - "[[business-logic/synthetic-legal-contracts/approval-chain-by-value-policy]]"
  - "[[structure/synthetic-legal-contracts/module-signature-orchestrator]]"
---

# Module: approval-router

ตัดสินใจว่าสัญญาฉบับหนึ่งต้องผ่านการอนุมัติจากใครบ้างตามมูลค่าและประเภทสัญญา เป็น service เดียวที่คำนวณ approval chain ทั้งหมด ไม่มี service อื่นคำนวณเส้นทางอนุมัติซ้ำเอง เพื่อไม่ให้เกิดความไม่สอดคล้องกันระหว่างจุดต่างๆ ของระบบ

## ฟังก์ชันหลัก
- `computeApprovalChain(contractId: string, value: number, type: string): Promise<ApprovalStep[]>` — คำนวณลำดับผู้อนุมัติตามมูลค่าและประเภทสัญญา
- `recordApproval(contractId: string, approverId: string, step: number): Promise<ApprovalStatus>` — บันทึกการอนุมัติของขั้นตอนหนึ่ง คืนสถานะรวมล่าสุด
- `isFullyApproved(contractId: string): Promise<boolean>` — ตรวจว่าสัญญาผ่านทุกขั้นตอนอนุมัติแล้วหรือยัง

## State

pending_approval → step-by-step approved → fully_approved | rejected — ดู [[business-logic/synthetic-legal-contracts/approval-chain-by-value-policy]]

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-legal-contracts/module-signature-orchestrator]] จะไม่เริ่มกระบวนการเซ็นเลยจนกว่า `isFullyApproved` จะคืนค่า true เท่านั้น ไม่มีทางข้ามขั้นตอนอนุมัติไปเซ็นได้
