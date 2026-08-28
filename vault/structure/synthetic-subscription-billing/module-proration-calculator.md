---
layer: structure
tags: [proration, module, core]
created: 2026-04-13
links:
  - "[[structure/synthetic-subscription-billing/module-plan-manager]]"
  - "[[business-logic/synthetic-subscription-billing/proration-method-selection-policy]]"
---

# Module: proration-calculator

คำนวณส่วนต่างค่าบริการเมื่อเปลี่ยนแพลนกลางรอบบิล เป็น pure calculation ไม่เก็บ state ถาวรของตัวเอง แยกออกมาเป็น service อิสระเพราะสูตร proration ซับซ้อนและมีหลายวิธีคำนวณ (รายวันเทียบรายเดือน) ที่ต้องเลือกใช้ตามประเภทแพลน

## ฟังก์ชันหลัก
- `calculateProration(subscriptionId: string, oldPlanId: string, newPlanId: string, changeDate: string): Promise<ProrationResult>` — คำนวณส่วนต่างค่าบริการจากการเปลี่ยนแพลน
- `getProrationMethod(planId: string): Promise<"daily" | "monthly">` — คืนวิธีคำนวณ proration ที่ใช้กับแพลนนั้น

## ความสัมพันธ์กับ module อื่น

ถูกเรียกแบบ synchronous จาก [[structure/synthetic-subscription-billing/module-plan-manager]] เท่านั้น ไม่มี endpoint สาธารณะให้เรียกตรงจากภายนอก เพื่อให้การคำนวณ proration เกิดขึ้นพร้อมกับการเปลี่ยนแพลนเสมอไม่มีช่วงเวลาที่ไม่สอดคล้องกัน ดู [[business-logic/synthetic-subscription-billing/proration-method-selection-policy]]
