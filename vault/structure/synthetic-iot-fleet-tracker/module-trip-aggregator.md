---
layer: structure
tags: [aggregation, module, core]
created: 2026-07-31
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
  - "[[structure/synthetic-iot-fleet-tracker/service-boundaries]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-route-optimizer]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy]]"
---

# Module: trip-aggregator

รวบรวม ping ดิบและ geofence event ของยานพาหนะแต่ละคันมาประกอบเป็น "ทริป" (จุดเริ่ม, จุดจบ, ระยะทาง, ระยะเวลา) ใช้เป็นข้อมูลตั้งต้นสำหรับการออกบิลลูกค้าและรายงานสรุป เป็น service เดียวที่ query ข้าม [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] และ [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]] พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู [[structure/synthetic-iot-fleet-tracker/service-boundaries]])

## ฟังก์ชันหลัก
- `closeTrip(vehicleId: string, endedAt: string): Promise<Trip>` — ปิดทริปปัจจุบันและคำนวณระยะทาง/ระยะเวลารวม
- `computeMileage(vehicleId: string, tripId: string): Promise<number>` — คำนวณระยะทางจากลำดับ ping ดิบด้วยสูตร haversine สะสมทีละคู่จุด
- `reconcileWithOdometer(tripId: string, odometerReading: number): Promise<ReconcileResult>` — เทียบระยะทางที่คำนวณได้กับเลขไมล์จริงจากรถ

## State

in_progress → closed | flagged_for_review (เมื่อ reconcile กับ odometer ต่างกันเกินเกณฑ์)

## ความสัมพันธ์กับ module อื่น

เป็น service เดียวที่รู้จักทั้ง ping ดิบและ geofence event พร้อมกัน — [[structure/synthetic-iot-fleet-tracker/module-route-optimizer]] ไม่เกี่ยวข้องกับทริปที่ปิดไปแล้วเลย เพราะ route-optimizer สนใจแค่เส้นทางที่กำลังจะเกิดขึ้น ดู [[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy]] สำหรับเกณฑ์ตัดสินว่าอะไรคือจุดเริ่ม/จบทริป
