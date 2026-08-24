---
layer: structure
tags: [occupancy, module]
created: 2026-06-11
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[structure/synthetic-smart-building/module-alert-dispatcher]]"
  - "[[business-logic/synthetic-smart-building/occupancy-based-lighting-policy]]"
---

# Module: occupancy-sensor-hub

รวบรวมสัญญาณจาก occupancy sensor (PIR ผสม CO2 sensor ในบางโซนประชุม) ของทุกชั้น แล้ว normalize เป็นสถานะ occupied/vacant ต่อโซนให้ module อื่นใช้ต่อ ไม่ตัดสินใจเชิงธุรกิจใดๆ เอง แค่ทำหน้าที่แปลงสัญญาณดิบจาก sensor หลายรุ่น (บางชั้นยังใช้ sensor รุ่นเก่าที่ส่งเป็น analog ผ่าน gateway แปลงสัญญาณต่างหาก) ให้เป็นรูปแบบเดียวกัน

## ฟังก์ชันหลัก
- `getZoneOccupancy(zoneId: string): Promise<OccupancyState>` — คืนสถานะ occupied/vacant ล่าสุดของโซนพร้อม confidence score
- `recordSensorPing(sensorId: string, zoneId: string, raw: RawSignal): Promise<void>` — บันทึกสัญญาณดิบจาก sensor แล้ว debounce ก่อนตัดสิน state เปลี่ยน
- `flagSensorOffline(sensorId: string, reason: string): Promise<void>` — แจ้งว่า sensor ตัวใดตัวหนึ่งขาดการติดต่อ

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-smart-building/module-hvac-controller]] และ [[structure/synthetic-smart-building/module-alert-dispatcher]] subscribe event `occupancy.changed` จากตัวนี้เหมือนกัน แต่ตีความคนละแบบ — hvac-controller ใช้ปรับ comfort band ส่วน alert-dispatcher ใช้เพื่อพิจารณาว่าจะ suppress alert บางประเภทตอนโซนไม่มีคนหรือไม่ ดู [[business-logic/synthetic-smart-building/occupancy-based-lighting-policy]]
