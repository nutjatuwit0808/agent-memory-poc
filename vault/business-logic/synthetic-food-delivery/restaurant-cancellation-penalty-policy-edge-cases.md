---
layer: business-logic
tags: [restaurant, cancellation, technical-fault, edge-case]
created: 2026-08-04
links:
  - "[[structure/synthetic-food-delivery/module-restaurant-relay]]"
  - "[[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]]"
---

# ข้อยกเว้นค่าปรับสำหรับร้านที่ออฟไลน์เพราะ Technical Fault

ถ้า [[structure/synthetic-food-delivery/module-restaurant-relay]] ตรวจจับได้ว่าร้านออฟไลน์เพราะ connectivity issue จากฝั่ง platform (เช่น webhook ของ QuickBite เอง fail ไม่ใช่ร้านปิด tablet เอง) ค่าปรับจะถูก waive อัตโนมัติและระบบ mark เหตุการณ์นี้ว่าเป็น `platform_fault`

ร้านที่ถูก `platform_fault` flag มากกว่า 3 ครั้งในเดือนเดียวกัน จะ trigger alert ให้ทีม infrastructure ตรวจสอบว่า integration กับร้านนั้นมีปัญหาซ่อนอยู่หรือไม่ แม้ในกรณีที่ทีมเคย conclude ว่าปัญหาแก้แล้วก็ตาม

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]] ("นโยบายค่าปรับเมื่อร้านยกเลิกออร์เดอร์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
