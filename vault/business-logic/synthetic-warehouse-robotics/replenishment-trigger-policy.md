---
layer: business-logic
tags: [inventory, replenishment, policy]
created: 2026-08-03
---

# นโยบายการเติมสินค้าอัตโนมัติ (Replenishment)

เมื่อจำนวนสินค้าใน forward-pick bin ต่ำกว่า 20% ของ capacity ระบบจะสร้าง replenishment task อัตโนมัติให้ดึงสินค้าจาก reserve storage มาเติม โดยไม่ต้องรอให้ bin ว่างสนิทก่อน

replenishment task มี priority ต่ำกว่า pick task ปกติเสมอ เพื่อไม่ให้แย่งหุ่นยนต์จาก order ที่ลูกค้ากำลังรอ
