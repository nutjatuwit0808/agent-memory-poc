---
layer: business-logic
tags: [payout, driver, policy]
created: 2026-01-04
links:
  - "[[structure/synthetic-food-delivery/module-driver-payout-engine]]"
---

# นโยบายการคำนวณรายได้คนขับ

รายได้ต่อออร์เดอร์คำนวณจาก 4 ส่วน: base fee ต่อออร์เดอร์, distance bonus (บาทต่อกิโลเมตรที่วิ่งจริง), surge bonus (ถ้า multiplier > 1.0 ณ เวลาที่ออร์เดอร์ถูกสร้าง), และ tip ที่ลูกค้าให้

[[structure/synthetic-food-delivery/module-driver-payout-engine]] คำนวณโดยใช้ค่า snapshot ทั้งหมดจาก order record ณ เวลา delivery ไม่ใช่ค่า live — ทำให้ไม่มีทางที่ payout จะเปลี่ยนไปหลังจาก confirm ครั้งเดียวแล้ว
