---
layer: business-logic
tags: [inventory, reservation]
created: 2026-04-12
links:
  - "[[structure/module-inventory]]"
  - "[[business-logic/order-cancellation-policy]]"
---

# กฎการกันสต็อกสินค้า (Inventory Reservation)

## ระยะเวลากันสต็อก

เมื่อลูกค้ากด "สั่งซื้อ" ระบบกันสต็อกไว้ 15 นาที (ดูฟังก์ชัน `reserveStock` ที่ [[structure/module-inventory]]) ถ้า checkout ไม่เสร็จภายในเวลานี้ สต็อกจะถูกปล่อยคืนอัตโนมัติให้ลูกค้าคนอื่นซื้อได้

## กรณีสินค้าเหลือน้อย (แข่งกันซื้อ)

ระบบใช้ optimistic locking ที่ระดับ database — คำขอ `reserveStock` สองคำขอพร้อมกันสำหรับสินค้าชิ้นสุดท้าย จะมีเพียงคำขอเดียวสำเร็จ อีกคำขอได้ error `INVENTORY_INSUFFICIENT` ทันที ไม่มีการเข้าคิวรอ

## การปล่อยสต็อกคืน

เกิดขึ้นใน 2 กรณี:
1. reservation หมดอายุ (เกิน 15 นาที)
2. ลูกค้ายกเลิกรายการก่อนถึง `packed` ตาม [[business-logic/order-cancellation-policy]]

ทั้งสองกรณีใช้ฟังก์ชันเดียวกันคือ `releaseStock(orderId)` เพื่อให้ logic การคืนสต็อกมีจุดเดียว ไม่ซ้ำซ้อนกันหลายที่ในโค้ด
