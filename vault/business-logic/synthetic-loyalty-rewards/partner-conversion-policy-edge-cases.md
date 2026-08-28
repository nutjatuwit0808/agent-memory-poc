---
layer: business-logic
tags: [partner, conversion, edge-case]
created: 2025-10-01
links:
  - "[[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]]"
---

# Conversion Rate เปลี่ยนระหว่าง Pending Window

ถ้า conversion rate ของ partner เปลี่ยนแปลงระหว่างที่ transaction อยู่ใน pending window ระบบจะใช้ rate ณ เวลาที่ transaction เข้ามา ไม่ใช่ rate ณ เวลาที่ยืนยัน เพราะการเปลี่ยน rate ย้อนหลังกับ transaction ที่สมาชิกตัดสินใจซื้อไปแล้วเป็นเรื่องไม่ยุติธรรม

การเปลี่ยน rate ใหม่มีผลกับ transaction ที่เข้ามาหลังจากเวลาที่ประกาศเปลี่ยน rate เท่านั้น ทีมต้องระบุ effective timestamp ให้ชัดเจนเมื่ออัปเดต partner conversion config

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]] ("นโยบาย Conversion Rate แต้มจาก Partner") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
