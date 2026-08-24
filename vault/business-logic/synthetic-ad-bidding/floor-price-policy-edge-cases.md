---
layer: business-logic
tags: [pricing, pmp, edge-case]
created: 2025-10-13
links:
  - "[[business-logic/synthetic-ad-bidding/floor-price-policy]]"
---

# ข้อยกเว้นสำหรับ Deal ID ที่มีราคาตกลงไว้ล่วงหน้า

bid request ที่มี deal ID แบบ fixed-price (ราคาตกลงตายตัว ไม่ใช่ auction แบบเปิด) จะไม่ผ่าน floor price check ปกติเลย เพราะราคาที่ส่งไปคือราคาที่ตกลงกันไว้ล่วงหน้าอยู่แล้ว การเทียบกับ floor price ทั่วไปไม่มีความหมายในบริบทนี้

ถ้าราคาที่ตกลงไว้ใน deal ต่ำกว่า floor price ทั่วไปของ placement นั้น (ซึ่งเกิดขึ้นได้ถ้า deal เก่าไม่ได้อัปเดตราคาตามตลาด) ระบบจะยังส่งราคา deal ออกไปตามที่ตกลงไว้ และแจ้งเตือนทีม account management ให้ไปคุยกับผู้ลงโฆษณาเรื่องปรับราคา deal แทนที่จะแก้ที่ระบบ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-ad-bidding/floor-price-policy]] ("นโยบาย Floor Price") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
