---
layer: structure
tags: [order, module]
created: 2026-01-10
links:
  - "[[structure/overview-architecture]]"
  - "[[structure/module-inventory]]"
  - "[[business-logic/order-cancellation-policy]]"
---

# Module: order-service

จัดการวงจรชีวิตของ order ตั้งแต่สร้างจนถึงปิดงาน

## ฟังก์ชันหลัก

- `createOrder(cart, customerId)` — สร้าง order ใหม่ เช็ค stock กับ [[structure/module-inventory]] ก่อนยืนยัน
- `cancelOrder(orderId, reason)` — ยกเลิก order ตามเงื่อนไขใน [[business-logic/order-cancellation-policy]]
- `getOrderStatus(orderId)` — คืนสถานะปัจจุบัน

## State machine

`created` → `paid` → `packed` → `shipped` → `delivered`

หรือ `created`/`paid` → `cancelled` (ถ้ายกเลิกก่อน pack) หรือ `paid` → `refunding` → `refunded` (ถ้ายกเลิกหลัง paid)

รายละเอียด state machine เต็มรูปแบบและทุก edge case ดูที่ [[business-logic/long-form-order-state-machine]]

## Event ที่ subscribe

- `refund.completed` จาก refund-service — เปลี่ยนสถานะเป็น `refunded`
- `inventory.reserved` จาก inventory-service — ยืนยันว่า stock ถูกกันไว้แล้วก่อน mark เป็น `paid`
