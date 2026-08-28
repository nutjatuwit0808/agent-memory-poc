---
layer: business-logic
tags: [ordering, minimum-value, promo, edge-case]
created: 2025-10-05
links:
  - "[[business-logic/synthetic-food-delivery/minimum-order-value-policy]]"
---

# ออร์เดอร์ที่ไม่ถึง Minimum เพราะ Promo Code ลดราคา

ถ้าออร์เดอร์ก่อนใช้ promo code ผ่าน minimum แต่หลังใช้แล้วต่ำกว่า minimum ระบบจะยังอนุญาตให้ออร์เดอร์ผ่านได้ — minimum check ใช้ราคาก่อน discount เสมอ เพราะ promo code เป็น mechanism ของ QuickBite เอง ไม่ควรทำให้ outcome แย่ลงสำหรับลูกค้าที่ทำตามกติกาถูกต้อง

ยกเว้น promo code ที่ร้านออกเอง (merchant-funded promotion) ซึ่งนับเป็นส่วนลดจริงจากมุมมองร้าน — กรณีนี้ minimum check ใช้ราคาหลัง discount เพราะร้านเป็นคนรับภาระ discount

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-food-delivery/minimum-order-value-policy]] ("นโยบายมูลค่าออร์เดอร์ขั้นต่ำ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
