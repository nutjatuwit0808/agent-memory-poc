---
layer: business-logic
tags: [inventory, policy]
created: 2026-05-31
links:
  - "[[structure/synthetic-warehouse-robotics/module-inventory-sync]]"
  - "[[business-logic/synthetic-warehouse-robotics/inventory-discrepancy-policy-edge-cases]]"
---

# นโยบายจัดการ Inventory Discrepancy

เมื่อ [[structure/synthetic-warehouse-robotics/module-inventory-sync]] เทียบจำนวนจริงจาก cycle count กับตัวเลขในระบบแล้วต่างกันเกิน 2 ชิ้นหรือเกิน 5% ของจำนวนที่ควรมี (แล้วแต่ค่าไหนมากกว่า) จะถือเป็น discrepancy ที่ต้องรายงาน

ระบบไม่แก้ตัวเลขในระบบให้ตรงกับที่นับได้ทันที — ต้องรอการยืนยันจากพนักงานคลังก่อนเสมอ เพื่อป้องกันกรณี cycle count เองผิดพลาด

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-warehouse-robotics/inventory-discrepancy-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
