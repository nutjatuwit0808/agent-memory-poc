---
layer: business-logic
tags: [escalation, out-of-spec, policy]
created: 2025-12-02
---

# นโยบาย Escalation เมื่อ Out-of-Spec ต่อเนื่อง

ถ้า product line เดิมมี batch ถูก reject เกิน 3 batch ติดต่อกันภายใน 8 ชั่วโมง ระบบจะ escalate ไปยัง Production Manager เพื่อพิจารณาหยุดสายผลิตชั่วคราว เพราะ pattern นี้มักบ่งชี้ว่า root cause อยู่ที่ process ไม่ใช่แค่ batch ผิดปกติเดี่ยวๆ

การ escalate เป็นการแจ้งเท่านั้น ไม่ใช่การหยุดสายอัตโนมัติ — Production Manager ต้องตัดสินใจว่าจะหยุดหรือดำเนินต่อ
