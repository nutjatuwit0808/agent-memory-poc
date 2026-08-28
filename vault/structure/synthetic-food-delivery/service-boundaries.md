---
layer: structure
tags: [food-delivery, quickbite, boundaries]
created: 2026-03-02
links:
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
  - "[[structure/synthetic-food-delivery/module-restaurant-relay]]"
  - "[[structure/synthetic-food-delivery/module-order-router]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-food-delivery/module-driver-dispatch]] เป็นเจ้าของสถานะคนขับทั้งหมด (ตำแหน่ง, สถานะ online/offline, ออร์เดอร์ที่ถืออยู่) ส่วน [[structure/synthetic-food-delivery/module-restaurant-relay]] เป็นเจ้าของข้อมูลสถานะของร้าน (เปิด/ปิด, เวลาเตรียมอาหาร, รัศมีรับออร์เดอร์) เท่านั้น

[[structure/synthetic-food-delivery/module-order-router]] เป็น service เดียวที่ query ข้าม [[structure/synthetic-food-delivery/module-driver-dispatch]] และ [[structure/synthetic-food-delivery/module-restaurant-relay]] พร้อมกันได้ เพราะการ route ออร์เดอร์ต้องเห็นทั้งคนขับที่ว่างและร้านที่พร้อมรับงานในเวลาเดียวกัน — ยอมให้ cross-domain query ตรงนี้เพื่อหลีกเลี่ยง race condition ระหว่างสอง service
