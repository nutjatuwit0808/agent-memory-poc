---
layer: structure
tags: [routing, module]
created: 2025-11-15
links:
  - "[[structure/synthetic-iot-fleet-tracker/service-boundaries]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]]"
---

# Module: route-optimizer

คำนวณเส้นทางที่ดีที่สุดสำหรับรถแต่ละคันตามจุดส่งของที่ต้องแวะ โดยพิจารณาสภาพการจราจรและข้อจำกัดถนน (เช่น น้ำหนักรถ, ถนนปิด) ทำงานเป็น on-demand calculation ไม่ได้อยู่บน critical path ของการรับ ping เพื่อไม่ให้การคำนวณเส้นทางที่หนักไปถ่วงความเร็วการรับสัญญาณ

## ฟังก์ชันหลัก
- `computeRoute(vehicleId: string, stops: Stop[]): Promise<RoutePlan>` — คำนวณลำดับการแวะจุดส่งของที่ใช้เวลารวมน้อยที่สุด
- `recomputeOnDeviation(vehicleId: string, currentPosition: PositionSnapshot): Promise<RoutePlan>` — คำนวณเส้นทางใหม่เมื่อรถออกนอกเส้นทางเดิมเกินระยะที่ยอมรับได้
- `reportRoadClosure(segmentId: string, reason: string): Promise<void>` — บันทึกถนนปิดชั่วคราว ใช้กันการคำนวณเส้นทางผ่านจุดนั้นซ้ำ

## ความสัมพันธ์กับ module อื่น

ไม่รู้จักสถานะอุปกรณ์เลย (ดู [[structure/synthetic-iot-fleet-tracker/service-boundaries]]) — เมื่อ [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]] รายงานว่ารถออกนอกเขตเส้นทางที่กำหนด จะเป็น [[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]] ที่ตัดสินใจว่าจะเรียก `recomputeOnDeviation` หรือไม่ แทนที่จะให้ route-optimizer ฟัง geofence event โดยตรง เพื่อคุม fan-in ของ event ให้อยู่ที่ dispatcher จุดเดียว
