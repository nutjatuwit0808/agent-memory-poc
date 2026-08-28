---
layer: structure
tags: [quarantine, module]
created: 2025-10-24
links:
  - "[[business-logic/synthetic-quality-control/quarantine-hold-duration-policy]]"
  - "[[structure/synthetic-quality-control/module-rework-coordinator]]"
---

# Module: quarantine-manager

จัดการ hold batch ที่ถูก quarantine ติดตาม duration ของแต่ละ hold ส่ง alert เมื่อถึงกำหนดปล่อย และควบคุมการยกเลิก hold ซึ่งต้องมีผู้มีอำนาจอนุมัติเสมอ แยกออกมาเพราะ logic การ expire และ notify ของ quarantine ซับซ้อนและแยกจาก workflow ตรวจ batch

## ฟังก์ชันหลัก
- `createHold(batchId: string, reason: QuarantineReason, holdDurationHours: number): Promise<HoldId>` — สร้าง hold ใหม่พร้อมกำหนด duration ตาม [[business-logic/synthetic-quality-control/quarantine-hold-duration-policy]]
- `releaseHold(holdId: string, releasedBy: string, evidence: string): Promise<void>` — ปล่อย hold หลัง rework ผ่านหรือมีเหตุผลยกเว้น ต้องระบุ evidence
- `listActiveHolds(productLineId?: string): Promise<Hold[]>` — ดูรายการ hold ที่ยังไม่ได้ปล่อย กรองตาม product line ได้
- `notifyExpiringHolds(lookaheadHours: number): Promise<void>` — ส่ง alert สำหรับ hold ที่ใกล้ครบกำหนดตาม lookahead window ที่กำหนด

## ความสัมพันธ์กับ module อื่น

ไม่ตัดสินใจเองว่าควรปล่อย hold เมื่อไหร่ — รอให้ [[structure/synthetic-quality-control/module-rework-coordinator]] ส่งผลผ่านหรือให้ผู้มีอำนาจสั่งยกเว้นตาม [[business-logic/synthetic-quality-control/quarantine-hold-duration-policy]] เท่านั้น
