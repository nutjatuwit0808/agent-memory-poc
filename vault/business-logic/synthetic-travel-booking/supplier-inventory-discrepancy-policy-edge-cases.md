---
layer: business-logic
tags: [inventory, supplier, edge-case]
created: 2025-09-19
links:
  - "[[business-logic/synthetic-travel-booking/supplier-inventory-discrepancy-policy]]"
---

# ข้อยกเว้นสำหรับที่พักยอดนิยม (High-demand)

ที่พักที่ถูกจัดกลุ่ม `high_demand` (จองหมดเร็วเป็นประจำ) ใช้เกณฑ์ trigger เพิ่มความถี่ sync ที่เข้มกว่า — discrepancy แค่ 1 ครั้งก็ trigger ทันทีโดยไม่ต้องรอสะสมถึง 3 ครั้ง เพราะห้องหมุนเร็วมากจนรอสะสมนานเกินไปจะพลาดโอกาสขายหรือเสี่ยง overbooking มากกว่าที่พักทั่วไป

ที่พักกลุ่มนี้ยังถูก sync เพิ่มด้วยมือได้จากทีม ops โดยตรงผ่าน `syncSupplierInventory` แม้จะยังไม่ถึงรอบ schedule ปกติ ต่างจากที่พักทั่วไปที่ต้องรอรอบ automatic เท่านั้น

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-travel-booking/supplier-inventory-discrepancy-policy]] ("นโยบายจัดการความคลาดเคลื่อนของ Inventory จากซัพพลายเออร์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
