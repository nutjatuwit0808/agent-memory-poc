---
layer: structure
tags: [dispatch, module, core]
created: 2025-11-24
links:
  - "[[structure/synthetic-food-delivery/module-order-router]]"
---

# Module: driver-dispatch

เจ้าของสถานะคนขับทุกคนในระบบ (ตำแหน่ง, สถานะ online/offline, ออร์เดอร์ที่ถืออยู่, rating) ทุก service อื่นที่ต้องรู้ว่าคนขับคนไหน "ว่าง" ต้อง query ผ่านตัวนี้เท่านั้น ไม่มี service ไหนเก็บ driver state ซ้ำเอง

## ฟังก์ชันหลัก
- `getAvailableDrivers(location: LatLng, radiusKm: number): Promise<Driver[]>` — คืนรายการคนขับที่ online และว่างอยู่ในรัศมีที่กำหนด เรียงตามระยะทาง
- `assignOrderToDriver(driverId: string, orderId: string): Promise<void>` — ล็อกออร์เดอร์ให้คนขับ เปลี่ยนสถานะคนขับเป็น busy ทันที
- `recordLocationUpdate(driverId: string, location: LatLng, timestamp: string): Promise<void>` — บันทึก location update ที่คนขับส่งเข้ามาทุก 3-5 วินาที
- `markDriverOffline(driverId: string, reason: string): Promise<void>` — เปลี่ยนสถานะคนขับเป็น offline และ requeue ออร์เดอร์ที่ยังไม่ถูก pick up

## State

online_idle → online_assigned → online_busy (กำลังไปรับ/ส่ง) → online_idle หรือ offline (จาก state ไหนก็ได้ถ้าคนขับกดออฟไลน์หรือหมดเวลา heartbeat)

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-food-delivery/module-order-router]] เรียก `getAvailableDrivers` ทุกครั้งก่อน route ออร์เดอร์ แต่ driver-dispatch ไม่รู้จัก concept ของ "ร้านอาหาร" หรือ "เมนู" เลย — รู้แค่ว่าคนขับคนไหน busy หรือว่าง การตัดสินใจ assignment ทั้งหมดอยู่ที่ order-router
