---
layer: business-logic
tags: [booking, inventory, policy]
created: 2025-10-12
links:
  - "[[structure/synthetic-travel-booking/module-booking-engine]]"
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
  - "[[structure/synthetic-travel-booking/module-price-cache]]"
  - "[[business-logic/synthetic-travel-booking/overbooking-prevention-policy-edge-cases]]"
---

# นโยบายป้องกัน Overbooking

ก่อน [[structure/synthetic-travel-booking/module-booking-engine]] จะยืนยันการจองใดๆ ต้องเช็คจำนวนห้องว่างจาก [[structure/synthetic-travel-booking/module-supplier-sync]] snapshot ล่าสุดเสมอ ไม่ใช่จาก [[structure/synthetic-travel-booking/module-price-cache]] ซึ่งเก็บแค่ราคา — การเช็คนี้เป็น hard requirement ที่ bypass ไม่ได้แม้ระบบจะช้าลงบ้าง

ถ้า snapshot มีอายุเกิน `PRICE_CACHE_STALE_GRACE_SEC` จะถือว่าไม่น่าเชื่อถือพอสำหรับการยืนยัน ระบบจะบังคับ sync สดจากซัพพลายเออร์ตรงๆ ก่อนยืนยันเสมอ แม้จะทำให้ผู้ใช้รอนานขึ้นสองสามวินาที

## ทำไมยอมให้ผู้ใช้รอนานขึ้นเพื่อความถูกต้อง

overbooking สร้างความเสียหายที่แก้ยากกว่า latency สูงมาก — ต้องหาที่พักทดแทน จ่ายค่าชดเชย และเสียความเชื่อมั่นของผู้ใช้ ทีมจึงตัดสินใจยอมแลก latency เพิ่มขึ้นเล็กน้อยในช่วงที่ snapshot ไม่สด เพื่อป้องกันปัญหาที่แก้ยากกว่ามาก

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-travel-booking/overbooking-prevention-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
