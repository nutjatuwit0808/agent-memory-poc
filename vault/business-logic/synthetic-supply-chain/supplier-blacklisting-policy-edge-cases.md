---
layer: business-logic
tags: [supplier, blacklist, edge-case]
created: 2026-05-01
links:
  - "[[business-logic/synthetic-supply-chain/dual-source-requirement-policy]]"
  - "[[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]]"
---

# ข้อยกเว้นการ Blacklist: ซัพพลายเออร์เจ้าเดียวในตลาด

สำหรับ SKU ที่มีซัพพลายเออร์รายเดียวในตลาด (single-source) และยังไม่มีทางเลือกอื่น การ blacklist ทันทีอาจหยุด production line ได้ กรณีนี้ระบบจะ flag เป็น `pending_blacklist` แทน ซึ่งยังอนุญาตให้สร้าง PO ได้แต่ต้องมีผู้อนุมัติพิเศษทุกใบ และต้องกำหนดแผน dual-source ภายใน 6 เดือน

ถ้าครบ 6 เดือนแล้วยังไม่หาซัพพลายเออร์สำรองได้ ต้องมีการ review ระดับ executive ว่าจะดำเนินการอย่างไร สถานะ `pending_blacklist` ไม่สามารถอยู่ได้ไม่จำกัดเวลา เพราะซัพพลายเออร์ที่มีปัญหาจะยิ่งมี leverage มากขึ้นเรื่อยๆ ดู [[business-logic/synthetic-supply-chain/dual-source-requirement-policy]]

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]] ("นโยบายการขึ้น Blacklist ซัพพลายเออร์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
