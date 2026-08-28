---
layer: business-logic
tags: [parts, inventory, edge-case]
created: 2025-12-06
links:
  - "[[business-logic/synthetic-fleet-maintenance/parts-minimum-stock-policy]]"
---

# กรณีสต็อกติดลบจาก Concurrent Deduction

ถ้า work order หลาย ใบ deduct stock พร้อมกันและทำให้สต็อกติดลบ ระบบจะ allow การติดลบชั่วคราวเพื่อไม่ให้ block งานซ่อม แต่จะสร้าง emergency purchase request อัตโนมัติและแจ้ง Purchasing Manager ทันที

สถานะ `negative_stock` ต้องถูก resolve ภายใน 2 วันทำการโดย Purchasing Manager ยืนยันว่ากำลังดำเนินการจัดหา ถ้าเกิน 2 วันโดยไม่มีการดำเนินการ ระบบจะ block work order ใหม่สำหรับ part นั้นจนกว่าจะ resolve

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fleet-maintenance/parts-minimum-stock-policy]] ("นโยบายสต็อกอะไหล่ขั้นต่ำ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
