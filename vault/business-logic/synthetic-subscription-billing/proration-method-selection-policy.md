---
layer: business-logic
tags: [proration, policy]
created: 2025-10-25
links:
  - "[[structure/synthetic-subscription-billing/module-proration-calculator]]"
  - "[[business-logic/synthetic-subscription-billing/proration-method-selection-policy-edge-cases]]"
---

# นโยบายการเลือกวิธีคำนวณ Proration

แพลนแต่ละประเภทกำหนดวิธีคำนวณ proration ของตัวเอง (`daily` คิดตามสัดส่วนวันจริงที่เหลือในรอบบิล หรือ `monthly` คิดเป็นเดือนเต็มไม่สนใจวันที่เปลี่ยน) — [[structure/synthetic-subscription-billing/module-proration-calculator]] เลือกวิธีตาม `getProrationMethod` เสมอ ไม่มีการ override เป็นรายกรณี

การเปลี่ยนแพลนภายในวันเดียวกัน (เช่น upgrade แล้ว downgrade กลับในวันเดียว) จะไม่เกิดการคำนวณ proration สองรอบ ระบบจะยุบเป็นการคำนวณครั้งเดียวจากแพลนต้นทางไปยังแพลนปลายทางสุดท้าย

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-subscription-billing/proration-method-selection-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
