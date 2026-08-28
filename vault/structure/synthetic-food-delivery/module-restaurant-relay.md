---
layer: structure
tags: [restaurant, module]
created: 2025-11-21
links:
  - "[[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]]"
  - "[[structure/synthetic-food-delivery/module-eta-estimator]]"
---

# Module: restaurant-relay

เชื่อมต่อระหว่าง QuickBite กับแต่ละร้านอาหาร รับผิดชอบส่งออร์เดอร์ไปให้ร้านยืนยัน รับสถานะเตรียมอาหาร และบริหารจัดการกรณีร้านไม่ตอบสนอง แยกออกมาเป็น service เพราะแต่ละร้านมี integration แตกต่างกัน (API, tablet app, webhook) ทำให้ความซับซ้อนด้านการสื่อสารอยู่ที่ service เดียว

## ฟังก์ชันหลัก
- `sendOrderToRestaurant(orderId: string, restaurantId: string): Promise<RelayResult>` — ส่งออร์เดอร์ให้ร้านผ่าน channel ที่ร้านนั้นรองรับ
- `pollRestaurantAcceptance(orderId: string, restaurantId: string): Promise<AcceptanceStatus>` — ตรวจสอบว่าร้านยืนยันออร์เดอร์แล้วหรือยัง
- `markRestaurantUnavailable(restaurantId: string, reason: string): Promise<void>` — ปิดร้านชั่วคราวใน routing pool ถ้าไม่ตอบสนองเกินเกณฑ์ ดู [[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]]

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-food-delivery/module-eta-estimator]] เรียก `getRestaurantPrepTime` ซึ่งดึงข้อมูลประวัติเวลาเตรียมอาหารจากตาราง `restaurants` ที่ service นี้ดูแล แต่ restaurant-relay ไม่รู้จัก ETA หรือ routing logic เลย รู้แค่ว่าร้านพร้อมรับหรือไม่
