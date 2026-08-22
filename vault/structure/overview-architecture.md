---
layer: structure
tags: [architecture, overview]
created: 2026-01-05
links:
  - "[[structure/module-payment]]"
  - "[[structure/module-refund]]"
  - "[[structure/module-order]]"
  - "[[structure/module-auth]]"
  - "[[structure/service-boundaries]]"
---

# ภาพรวมสถาปัตยกรรม PayFlow

PayFlow คือระบบ backend สำหรับร้านค้าออนไลน์ขนาดกลาง แบ่งเป็น service ย่อยตาม domain โดยสื่อสารกันผ่าน HTTP + message queue

## Service หลัก

- **order-service** — จัดการวงจรชีวิตของ order ดู [[structure/module-order]]
- **payment-service** — เชื่อมต่อ payment gateway ภายนอก ดู [[structure/module-payment]]
- **refund-service** — แยกออกจาก payment-service ตั้งแต่ปี 2025 เพราะ refund มี business rule ซับซ้อนขึ้นเรื่อยๆ ดู [[structure/module-refund]]
- **auth-service** — authentication/authorization ดู [[structure/module-auth]]
- **notification-service** — ส่ง email/SMS/push ดู [[structure/module-notification]]
- **inventory-service** — จัดการสต็อก ดู [[structure/module-inventory]]

## การสื่อสารระหว่าง service

Synchronous call ผ่าน API gateway (ดู [[structure/api-gateway]]) ใช้เมื่อ caller ต้องรอผลลัพธ์ทันที เช่น การเช็ค inventory ก่อนสร้าง order

Asynchronous ผ่าน message queue (ดู [[structure/queue-architecture]]) ใช้เมื่อเป็น event ที่ service อื่นแค่ต้อง "รับทราบ" เช่น `order.created`, `refund.approved`

รายละเอียดว่า service ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/service-boundaries]]

## หลักการออกแบบ

แต่ละ service มี database ของตัวเอง ไม่ share table ข้าม service — ถ้า service อื่นต้องการข้อมูลต้องเรียกผ่าน API หรือ subscribe event เท่านั้น เพื่อไม่ให้ schema เปลี่ยนแล้วพังข้าม team
