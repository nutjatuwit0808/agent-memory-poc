---
layer: structure
tags: [notification, module]
created: 2026-01-18
links:
  - "[[structure/overview-architecture]]"
  - "[[structure/queue-architecture]]"
---

# Module: notification-service

ส่งข้อความหา customer ผ่าน 3 ช่องทาง: email, SMS, push notification

## ฟังก์ชันหลัก

- `sendEmail(template, recipient, data)`
- `sendSms(template, phoneNumber, data)`
- `sendPush(template, deviceToken, data)`

ทุกฟังก์ชันเป็น fire-and-forget — caller ไม่รอผลส่งจริง เพราะ SMS/email provider อาจช้าเป็นวินาที การรอจะทำให้ request หลักช้าตามไปด้วย ดูเหตุผลเรื่อง async ที่ [[structure/queue-architecture]]

## Template ที่ใช้บ่อย

- `order-confirmed` — ส่งตอน order เปลี่ยนเป็น `paid`
- `refund-approved` — ส่งตอน refund-service ยืนยันคืนเงิน
- `refund-stuck-internal` — ส่งหา ทีม support ภายใน (ไม่ใช่ลูกค้า) เมื่อ refund ค้างเกิน threshold

## ข้อจำกัด

SMS provider จำกัด rate 20 ข้อความ/วินาที ต่อ account — เกินกว่านี้ระบบจะ queue รอแทนที่จะ error
