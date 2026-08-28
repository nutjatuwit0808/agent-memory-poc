---
layer: structure
tags: [eta, module, core]
created: 2026-01-23
links:
  - "[[structure/synthetic-food-delivery/module-restaurant-relay]]"
  - "[[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]]"
---

# Module: eta-estimator

คำนวณ ETA ของออร์เดอร์แบบ real-time โดยรวมเวลา 3 ส่วน: เวลาเดินทางของคนขับไปถึงร้าน, เวลาเตรียมอาหารของร้าน, และเวลาเดินทางจากร้านถึงลูกค้า แยกออกมาเป็น service เพราะ logic การประมาณเวลาใช้ external traffic data และ ML model ของร้านแต่ละแห่ง ซึ่งซับซ้อนเกินกว่าจะอยู่ใน order-router

## ฟังก์ชันหลัก
- `estimateETA(orderId: string, driverId: string, restaurantId: string): Promise<ETABreakdown>` — คำนวณ ETA รวม 3 ส่วนพร้อม confidence interval
- `refreshETA(orderId: string): Promise<ETABreakdown>` — อัปเดต ETA เมื่อ traffic หรือสถานการณ์เปลี่ยน เรียกทุก 2 นาทีต่อออร์เดอร์ที่ active
- `getRestaurantPrepTime(restaurantId: string, itemCount: number): Promise<number>` — ประมาณเวลาเตรียมอาหารโดย query ประวัติร้านจาก [[structure/synthetic-food-delivery/module-restaurant-relay]]

## State

estimating → ready | failed_traffic_data (ใช้ fallback estimate)

## ความสัมพันธ์กับ module อื่น

ขึ้นกับ external traffic data API ที่อาจ down ได้ — ถ้า traffic data ไม่พร้อมจะใช้ค่าประมาณ fallback แทน แต่ค่าดังกล่าวจะมี confidence interval กว้างกว่า แนะนำให้แสดงผลแบบ "ประมาณ X-Y นาที" แทน exact number ตาม [[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]]
