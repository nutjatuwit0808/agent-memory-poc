---
layer: business-logic
tags: [routing, delivery-radius, pre-order, edge-case]
created: 2026-06-05
links:
  - "[[business-logic/synthetic-food-delivery/max-delivery-radius-policy]]"
---

# ข้อยกเว้นรัศมีสำหรับออร์เดอร์ Pre-order และ Scheduled Delivery

ออร์เดอร์แบบ pre-order (สั่งล่วงหน้าเกิน 60 นาที) ได้รัศมีขยายเป็น 1.5 เท่าของค่าปกติ เพราะระบบมีเวลาเพียงพอที่จะรอคนขับที่เหมาะกว่ามาออนไลน์ โดยจะเริ่ม dispatch คนขับจริงแค่ 15 นาทีก่อนเวลานัด

ร้านอาหารที่อยู่ใน premium zone (ร้านที่ทำ SLA พิเศษกับ QuickBite) ใช้รัศมีคงที่ที่ตกลงไว้ใน contract ซึ่งอาจมากหรือน้อยกว่าค่า default ก็ได้ ค่านี้ถูก override ใน `restaurants.dispatch_radius_km` ในฐานข้อมูล ไม่ใช้ env var

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-food-delivery/max-delivery-radius-policy]] ("นโยบายรัศมีสูงสุดในการจัดส่ง") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
