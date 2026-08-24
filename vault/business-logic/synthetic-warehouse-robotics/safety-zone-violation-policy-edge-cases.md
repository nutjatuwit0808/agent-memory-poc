---
layer: business-logic
tags: [safety, maintenance, edge-case]
created: 2026-01-03
links:
  - "[[business-logic/synthetic-warehouse-robotics/safety-zone-violation-policy]]"
---

# โหมดบำรุงรักษา (Maintenance Mode) กับการยกเว้น Safety Zone

เมื่อทีมซ่อมบำรุงเปิด maintenance mode สำหรับโซนใดโซนหนึ่งอย่างเป็นทางการ (ผ่านขั้นตอนที่มีการล็อกกุญแจทางกายภาพร่วมด้วย ไม่ใช่แค่ toggle ในระบบ) หุ่นยนต์ในโซนนั้นจะถูกสั่งหยุดล่วงหน้าทั้งหมดก่อนคนเข้า ไม่ต้องรอให้เซ็นเซอร์ตรวจจับแล้วค่อย emergency stop

การออกจาก maintenance mode ต้องมีการเดินตรวจโซนให้แน่ใจว่าไม่มีคนหรือสิ่งกีดขวางค้างอยู่ก่อนเปิดให้หุ่นยนต์กลับมาทำงาน ขั้นตอนนี้เข้มกว่าการปลดล็อกจาก emergency stop ปกติ เพราะช่วง maintenance มักมีการเคลื่อนย้ายอุปกรณ์หนัก

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-warehouse-robotics/safety-zone-violation-policy]] ("นโยบายเมื่อมีคนเข้าโซนทำงานของหุ่นยนต์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
