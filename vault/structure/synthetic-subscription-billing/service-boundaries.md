---
layer: structure
tags: [subscription-billing, recurflow, boundaries]
created: 2025-09-05
links:
  - "[[structure/synthetic-subscription-billing/module-plan-manager]]"
  - "[[structure/synthetic-subscription-billing/module-proration-calculator]]"
  - "[[structure/synthetic-subscription-billing/module-invoice-generator]]"
  - "[[structure/synthetic-subscription-billing/module-usage-meter]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-subscription-billing/module-plan-manager]] เป็นเจ้าของสถานะแพลนปัจจุบันของทุก subscription ส่วน [[structure/synthetic-subscription-billing/module-proration-calculator]] เป็นแค่ pure calculation ไม่เก็บ state ถาวรของตัวเอง

[[structure/synthetic-subscription-billing/module-invoice-generator]] ไม่คำนวณราคาเอง อ่านผลจาก [[structure/synthetic-subscription-billing/module-proration-calculator]] และ [[structure/synthetic-subscription-billing/module-usage-meter]] เท่านั้น เพื่อให้มีจุดเดียวที่ตัดสินใจราคาที่ถูกต้อง ไม่ให้ logic การคำนวณราคากระจายอยู่หลายที่
