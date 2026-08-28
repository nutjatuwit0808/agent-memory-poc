---
layer: structure
tags: [pricing, module]
created: 2026-06-05
links:
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
  - "[[structure/synthetic-food-delivery/module-order-router]]"
  - "[[business-logic/synthetic-food-delivery/surge-multiplier-cap-policy]]"
---

# Module: surge-pricer

คำนวณ surge multiplier สำหรับออร์เดอร์ในพื้นที่และช่วงเวลาที่ demand สูงกว่า supply คนขับ อ่านข้อมูล demand/supply จาก [[structure/synthetic-food-delivery/module-driver-dispatch]] และ [[structure/synthetic-food-delivery/module-order-router]] แล้วคำนวณ multiplier ตามสูตรที่ตั้งไว้ล่วงหน้า — ไม่ใช้ ML ตัดสินใจ เพื่อให้ predictable และ auditable

## ฟังก์ชันหลัก
- `getSurgeMultiplier(restaurantZoneId: string): Promise<SurgeResult>` — คืน multiplier ปัจจุบันของโซนร้านอาหาร คืน 1.0 ถ้าไม่มี surge
- `computeSurgeForZone(zoneId: string, pendingOrders: number, availableDrivers: number): Promise<number>` — คำนวณ multiplier จาก demand/supply ratio ตามสูตรที่กำหนดใน [[business-logic/synthetic-food-delivery/surge-multiplier-cap-policy]]
- `recordSurgeEvent(zoneId: string, multiplier: number, durationMin: number): Promise<void>` — บันทึก surge event เพื่อวิเคราะห์แนวโน้มย้อนหลัง

## ความสัมพันธ์กับ module อื่น

ไม่ตัดสินใจเรื่อง routing หรือ dispatch เลย — เป็นแค่ oracle ที่คืนราคา multiplier ให้ [[structure/synthetic-food-delivery/module-order-router]] นำไปแสดงผลและใช้ในการคำนวณราคา อ้างอิง cap สูงสุดจาก [[business-logic/synthetic-food-delivery/surge-multiplier-cap-policy]] เสมอ
