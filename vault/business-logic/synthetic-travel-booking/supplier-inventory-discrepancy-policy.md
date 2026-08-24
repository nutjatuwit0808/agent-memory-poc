---
layer: business-logic
tags: [inventory, supplier, policy]
created: 2026-05-12
links:
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
  - "[[business-logic/synthetic-travel-booking/supplier-inventory-discrepancy-policy-edge-cases]]"
---

# นโยบายจัดการความคลาดเคลื่อนของ Inventory จากซัพพลายเออร์

เมื่อ `reconcileDiscrepancy` เทียบ snapshot กับผลการจองจริงแล้วพบว่าต่างกัน (เช่น ซัพพลายเออร์บอกว่าเต็มแต่จองผ่านได้ หรือบอกว่าว่างแต่จองไม่ผ่าน) ต้องบันทึกเป็น discrepancy event เสมอ ไม่เงียบผ่าน

discrepancy ที่เกิดถี่เกิน 3 ครั้งใน 1 ชั่วโมงกับซัพพลายเออร์รายเดียวกัน จะ trigger ให้ [[structure/synthetic-travel-booking/module-supplier-sync]] เพิ่มความถี่การ sync ชั่วคราวโดยอัตโนมัติ แทนที่จะรอให้คนมาปรับ config เอง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-travel-booking/supplier-inventory-discrepancy-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
