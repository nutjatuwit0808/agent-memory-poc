---
layer: business-logic
tags: [pricing, peak-season, policy]
created: 2026-04-28
links:
  - "[[structure/synthetic-travel-booking/module-price-cache]]"
---

# นโยบายราคาช่วง Peak Season

ราคาที่แสดงในช่วง peak season (ธันวาคม-มกราคม, สงกรานต์) มาจากซัพพลายเออร์โดยตรงเป็นหลัก ระบบไม่ปรับราคาซ้อนเองเพิ่มเติม แต่ปรับความถี่การ invalidate [[structure/synthetic-travel-booking/module-price-cache]] ให้ถี่ขึ้นเพราะราคาช่วงนี้เปลี่ยนบ่อยกว่าปกติมาก

TTL ของ price cache ในช่วง peak season ลดลงเหลือครึ่งหนึ่งของค่าปกติโดยอัตโนมัติตามปฏิทินที่กำหนดไว้ล่วงหน้า ไม่ต้องรอให้คนมาปรับ config เอง
