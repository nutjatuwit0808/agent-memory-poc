---
layer: structure
tags: [travel-booking, tripledger, database, schema]
created: 2026-03-25
links:
  - "[[structure/synthetic-travel-booking/module-booking-engine]]"
  - "[[structure/synthetic-travel-booking/module-itinerary-builder]]"
  - "[[structure/synthetic-travel-booking/module-price-cache]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-travel-booking/module-booking-engine]] ดูแลคือ `bookings` และ `booking_holds` (การจองชั่วคราวก่อนยืนยัน) ส่วน `itineraries` เป็นของ [[structure/synthetic-travel-booking/module-itinerary-builder]] ที่อ้างอิง booking หลายตัวรวมเป็นทริปเดียว

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `bookings` | booking-engine | สถานะสุดท้ายของการจองแต่ละรายการ |
| `booking_holds` | booking-engine | การจองชั่วคราว TTL สั้น ก่อนยืนยันจริง |
| `supplier_inventory_snapshot` | supplier-sync | ภาพล่าสุดของ inventory จากแต่ละซัพพลายเออร์ |
| `itineraries` | itinerary-builder | รวม booking หลายตัวเป็นทริปเดียวสำหรับผู้เดินทาง |
| `refunds` | cancellation-handler | ประวัติการคืนเงินแยกจาก booking หลัก |

`price_cache` ไม่ได้อยู่ใน database หลัก — เก็บใน in-memory store แยกต่างหาก (ดู [[structure/synthetic-travel-booking/module-price-cache]]) เพราะต้องการความเร็วในการอ่านสูงกว่าที่ database ทั่วไปให้ได้ และยอมรับได้ว่าข้อมูลหายได้ถ้า service restart เพราะ warm cache ใหม่จากซัพพลายเออร์ได้เสมอ
