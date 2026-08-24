---
layer: business-logic
tags: [booking, concurrency, policy]
created: 2025-11-13
links:
  - "[[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy-edge-cases]]"
---

# นโยบายความเป็น Atomic ของ Booking Hold

การสร้าง hold ผ่าน `holdInventory` ต้องเป็น atomic operation ระดับ database เสมอ — ใช้ conditional update ที่เช็คจำนวนห้องว่างและลดจำนวนในคำสั่งเดียวกัน ห้ามแยกเป็นขั้นตอน "อ่านจำนวนว่าง" แล้ว "เขียนลดจำนวน" คนละคำสั่ง เพราะเปิดช่องให้เกิด race condition

เมื่อห้องสุดท้ายถูก hold ไปแล้ว request ที่มาทีหลังต้องได้รับ error ทันทีในคำตอบเดียว ไม่ใช่ได้ hold token ปลอมแล้วมาพังตอน confirm

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
