---
layer: structure
tags: [obligation, module]
created: 2026-07-27
links:
  - "[[business-logic/synthetic-legal-contracts/obligation-milestone-sla-policy]]"
---

# Module: obligation-tracker

ติดตามพันธะสัญญาหลังลงนาม เช่น กำหนดส่งมอบงาน เงื่อนไขการชำระ milestone หรือข้อผูกพันอื่นที่ระบุในสัญญา แยกออกมาจาก signature-orchestrator เพราะพันธะสัญญาต้องติดตามต่อเนื่องเป็นเดือนหรือปีหลังจากเซ็นเสร็จแล้ว ไม่ใช่แค่ช่วงกระบวนการเซ็น

## ฟังก์ชันหลัก
- `createObligationsFromContract(contractId: string): Promise<Obligation[]>` — สร้าง obligation record จากเงื่อนไขในสัญญาที่เพิ่งเซ็นเสร็จ
- `markMilestoneComplete(obligationId: string): Promise<void>` — บันทึกว่า milestone หนึ่งเสร็จสมบูรณ์แล้ว
- `getOverdueObligations(): Promise<Obligation[]>` — คืนรายการ obligation ที่เลยกำหนดแล้วยังไม่เสร็จ

## ความสัมพันธ์กับ module อื่น

ทุก obligation ที่สร้างจะผูกกับ contractId แบบ soft reference ไม่ใช้ FK ตรงเพราะอยู่คนละ database — ดู [[business-logic/synthetic-legal-contracts/obligation-milestone-sla-policy]] สำหรับ SLA การติดตาม
