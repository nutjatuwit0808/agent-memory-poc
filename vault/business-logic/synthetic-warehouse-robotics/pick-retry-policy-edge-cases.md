---
layer: business-logic
tags: [picking, retry, edge-case]
created: 2025-12-26
links:
  - "[[business-logic/synthetic-warehouse-robotics/inventory-discrepancy-policy]]"
  - "[[business-logic/synthetic-warehouse-robotics/damaged-item-handling-policy]]"
  - "[[business-logic/synthetic-warehouse-robotics/pick-retry-policy]]"
---

# ข้อยกเว้นของนโยบาย Retry การหยิบสินค้า

ถ้าสินค้าหยิบไม่สำเร็จเพราะ reason `not_found` (ไม่ใช่ `grip_slip`) ระบบจะไม่ retry ที่ตำแหน่งเดิมเลยแม้แต่ครั้งเดียว เพราะการลองจับซ้ำที่ตำแหน่งที่ไม่มีสินค้าจริงไม่มีประโยชน์ — จะส่งตรงไป `failed_hard` ทันทีเพื่อ trigger cycle count ผ่าน [[business-logic/synthetic-warehouse-robotics/inventory-discrepancy-policy]]

สินค้าที่ถูก flag ว่าเสียหายระหว่างพยายามหยิบ (ดู [[business-logic/synthetic-warehouse-robotics/damaged-item-handling-policy]]) ก็ไม่เข้าเงื่อนไข retry เช่นกัน เพราะการลองจับซ้ำอาจทำให้สินค้าเสียหายมากขึ้น

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-warehouse-robotics/pick-retry-policy]] ("นโยบายการ Retry เมื่อหยิบสินค้าไม่สำเร็จ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
