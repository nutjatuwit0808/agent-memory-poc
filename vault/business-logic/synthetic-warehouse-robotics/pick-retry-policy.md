---
layer: business-logic
tags: [picking, retry, policy]
created: 2026-06-07
links:
  - "[[structure/synthetic-warehouse-robotics/module-picking-engine]]"
  - "[[business-logic/synthetic-warehouse-robotics/pick-retry-policy-edge-cases]]"
---

# นโยบายการ Retry เมื่อหยิบสินค้าไม่สำเร็จ

เมื่อ [[structure/synthetic-warehouse-robotics/module-picking-engine]] หยิบสินค้าไม่สำเร็จ ระบบจะจัดหมวดผลลัพธ์เป็น `failed_soft` (ลองใหม่ได้ เช่น จับพลาดเพราะมุมไม่พอดี) หรือ `failed_hard` (ต้องให้คนช่วย เช่น หาสินค้าในตำแหน่งไม่เจอเลย)

`failed_soft` จะถูก retry อัตโนมัติสูงสุด `PICK_ENGINE_MAX_RETRY` ครั้งก่อนถูกยกระดับเป็น `failed_hard` โดยอัตโนมัติ เพื่อไม่ให้หุ่นยนต์ค้างพยายามจับซ้ำไม่จบที่หน้า bin เดียว

## ทำไมไม่ retry ไม่จำกัดครั้ง

การจับพลาดซ้ำๆ ที่ตำแหน่งเดิมมักไม่ใช่ปัญหาชั่วคราว แต่เป็นสัญญาณว่าสินค้าอยู่ผิดตำแหน่งจริง หรือ grip profile ไม่เหมาะกับสินค้าชิ้นนั้น การ retry ไม่จำกัดจะเปลืองเวลาคิวของหุ่นยนต์ตัวนั้นโดยเปล่าประโยชน์ และหน่วง task อื่นที่รออยู่

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-warehouse-robotics/pick-retry-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
