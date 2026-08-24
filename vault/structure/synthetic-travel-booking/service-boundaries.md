---
layer: structure
tags: [travel-booking, tripledger, boundaries]
created: 2025-12-26
links:
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
  - "[[structure/synthetic-travel-booking/module-price-cache]]"
  - "[[structure/synthetic-travel-booking/module-booking-engine]]"
  - "[[structure/synthetic-travel-booking/module-itinerary-builder]]"
  - "[[structure/synthetic-travel-booking/module-cancellation-handler]]"
---

# Service Boundaries

[[structure/synthetic-travel-booking/module-supplier-sync]] เป็นเจ้าของ snapshot inventory ที่ sync มาจากซัพพลายเออร์ล่าสุด ส่วน [[structure/synthetic-travel-booking/module-price-cache]] เป็นเจ้าของ **ราคา** ที่ cache ไว้เท่านั้น สองอย่างนี้แยกกันโดยเจตนาเพราะราคาผันผวนบ่อยกว่าจำนวนห้องว่างมาก การรวมสองอย่างไว้ที่เดียวจะทำให้ invalidate cache บ่อยเกินจำเป็นเวลาแค่ราคาขยับแต่ห้องว่างไม่เปลี่ยน

[[structure/synthetic-travel-booking/module-booking-engine]] เป็น service เดียวที่มีสิทธิ์เขียนสถานะ `bookings` — [[structure/synthetic-travel-booking/module-itinerary-builder]] อ่านข้อมูล booking ที่ยืนยันแล้วมาประกอบเป็นทริป แต่ไม่แก้สถานะ booking เอง ส่วน [[structure/synthetic-travel-booking/module-cancellation-handler]] แก้สถานะ booking ได้เฉพาะ transition ไปทาง `cancelled` เท่านั้น เพื่อไม่ให้ logic การยกเลิกไปแตะ state อื่นที่ไม่เกี่ยวข้อง
