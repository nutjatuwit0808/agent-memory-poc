---
layer: structure
tags: [picking, module, core]
created: 2026-08-10
links:
  - "[[business-logic/synthetic-warehouse-robotics/pick-retry-policy]]"
  - "[[structure/synthetic-warehouse-robotics/module-inventory-sync]]"
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
---

# Module: picking-engine

รับผิดชอบตัดสินใจ "หยิบยังไง" ในระดับการเคลื่อนไหวจริงของแขนหุ่นยนต์ แยกออกมาจาก task-scheduler ตั้งแต่ต้นปี 2025 เพราะ logic การหยิบ (grip force, retry angle, การจัดการสินค้ารูปทรงแปลก) ซับซ้อนขึ้นเรื่อยๆ จนปนกับ logic การจัดคิวงานแล้วทดสอบยาก

## ฟังก์ชันหลัก
- `attemptPick(robotId: string, binId: string, sku: string): Promise<PickResult>` — สั่งหยิบจริง 1 ครั้ง คืนผลว่าสำเร็จ/พลาด/ไม่พบสินค้า
- `computeGripProfile(sku: string): GripProfile` — คำนวณแรงบีบและมุมจับตาม product profile ของ SKU นั้น
- `reportPickFailure(taskId: string, reason: PickFailReason): Promise<void>` — แจ้งผลพลาดกลับไปยัง task-scheduler พร้อมเหตุผลที่จัดหมวดไว้แล้ว

## State

attempting → succeeded | failed_soft (ลองใหม่ได้) | failed_hard (ต้องคนช่วย) — ดู [[business-logic/synthetic-warehouse-robotics/pick-retry-policy]] สำหรับเงื่อนไขว่าเมื่อไหร่ retry เมื่อไหร่ escalate

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-warehouse-robotics/module-inventory-sync]] โดยตรง — ถ้าหยิบไม่เจอสินค้าในตำแหน่งที่ระบุ จะ report เป็น `not_found` กลับไปที่ [[structure/synthetic-warehouse-robotics/module-task-scheduler]] แล้วปล่อยให้ task-scheduler เป็นคนตัดสินใจว่าจะ trigger cycle count หรือไม่ เพื่อรักษาหลัก separation of concerns
