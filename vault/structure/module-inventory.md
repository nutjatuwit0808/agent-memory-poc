---
layer: structure
tags: [inventory, stock, module]
created: 2026-01-19
links:
  - "[[structure/module-order]]"
  - "[[business-logic/inventory-reservation-rules]]"
---

# Module: inventory-service

จัดการจำนวนสต็อกสินค้าและการกันสต็อก (reservation) ระหว่างขั้นตอนสั่งซื้อ

## ฟังก์ชันหลัก

- `checkStock(sku, quantity)` — เช็คว่ามีของพอไหม แบบ read-only
- `reserveStock(sku, quantity, orderId)` — กันสต็อกไว้ชั่วคราว หมดอายุใน 15 นาทีถ้า order ยังไม่ถูก confirm
- `releaseStock(orderId)` — คืนสต็อกที่กันไว้ เมื่อ order ถูกยกเลิกหรือ reservation หมดอายุ
- `commitStock(orderId)` — ตัดสต็อกจริงเมื่อ order เปลี่ยนเป็น `paid`

รายละเอียดกฎการกันสต็อกและกรณีแย่งกันระหว่างหลาย order พร้อมกันดูที่ [[business-logic/inventory-reservation-rules]]

## ความสัมพันธ์กับ order-service

order-service เรียก `reserveStock` ก่อนสร้าง order เสมอ — ถ้า reserve ไม่สำเร็จ (`INVENTORY_INSUFFICIENT`) order จะไม่ถูกสร้างเลย ไม่ใช่สร้างแล้วค่อย fail ทีหลัง
