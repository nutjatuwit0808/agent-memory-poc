---
layer: structure
tags: [routing, module, core]
created: 2026-05-17
links:
  - "[[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]]"
  - "[[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]]"
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
  - "[[structure/synthetic-food-delivery/module-eta-estimator]]"
---

# Module: order-router

รับออร์เดอร์ใหม่จาก API gateway แล้วตัดสินใจว่าจะส่งให้ร้านไหนและคนขับคนไหน — เป็น service เดียวที่เห็นภาพรวมทั้ง supply (คนขับว่าง) และ demand (ออร์เดอร์รอ) พร้อมกัน แยกออกมาจาก driver-dispatch เพราะ logic การ match ออร์เดอร์กับคนขับซับซ้อนขึ้นเรื่อยๆ จนปนกับ logic ติดตามสถานะคนขับแล้วทดสอบยาก

## ฟังก์ชันหลัก
- `routeOrder(orderId: string, restaurantId: string, customerLocation: LatLng): Promise<RoutingResult>` — เลือกคนขับที่เหมาะสมที่สุดสำหรับออร์เดอร์ คืนผลว่าจับคู่สำเร็จหรือไม่มีคนขับว่าง
- `requeueOrder(orderId: string, reason: string): Promise<void>` — ดันออร์เดอร์กลับเข้าคิวเมื่อคนขับปฏิเสธหรือออฟไลน์กะทันหัน
- `cancelOrder(orderId: string, initiatedBy: 'customer' | 'restaurant' | 'system'): Promise<void>` — ยกเลิกออร์เดอร์พร้อมบันทึกผู้ริเริ่ม เพื่อใช้คำนวณค่าปรับตาม [[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]]
- `getOrderStatus(orderId: string): Promise<OrderStatus>` — คืนสถานะออร์เดอร์ปัจจุบันพร้อม ETA ล่าสุด

## State

pending → restaurant_accepted → driver_assigned → picked_up → delivered | cancelled — ดู [[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]] สำหรับเงื่อนไขว่าเมื่อไหร่ requeue เมื่อไหร่ cancel

## ความสัมพันธ์กับ module อื่น

ไม่เก็บตำแหน่งคนขับเองเลย — ต้อง query ผ่าน [[structure/synthetic-food-delivery/module-driver-dispatch]] ทุกครั้งที่ต้องการข้อมูลตำแหน่ง เพื่อรักษาหลัก single source of truth สำหรับ driver state อ้างอิง ETA ล่าสุดจาก [[structure/synthetic-food-delivery/module-eta-estimator]]
