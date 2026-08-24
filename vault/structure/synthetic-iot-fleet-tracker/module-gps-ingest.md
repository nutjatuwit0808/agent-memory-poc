---
layer: structure
tags: [ingest, module, core]
created: 2026-03-18
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
  - "[[structure/synthetic-iot-fleet-tracker/queue-architecture]]"
---

# Module: gps-ingest

รับ ping ดิบจากอุปกรณ์ GPS tracker ทุกตัวผ่าน UDP listener แบบ lightweight แล้วแปลงเป็น structured event ก่อนส่งต่อเข้า queue หลัก แยกออกมาเป็น service อิสระตั้งแต่ต้นเพราะ throughput ที่ต้องรับ (สูงสุดกว่า 20,000 ping/วินาทีช่วง rush window) ต้องการ path ที่บางที่สุดเท่าที่จะทำได้ ไม่ปนกับ logic ธุรกิจใดๆ

## ฟังก์ชันหลัก
- `ingestPing(deviceId: string, raw: RawPingPayload): Promise<void>` — รับ ping ดิบ validate โครงสร้างเบื้องต้น แล้ว publish เข้า queue
- `getLatestPosition(deviceId: string): Promise<PositionSnapshot | null>` — คืนตำแหน่งล่าสุดที่รู้จักของอุปกรณ์ ใช้ตอบ dashboard แบบ synchronous
- `markDeviceOffline(deviceId: string): Promise<void>` — เปลี่ยนสถานะอุปกรณ์เป็น offline เมื่อไม่มี ping เข้ามาเกิน threshold

## State

online → (ไม่มี ping ครบ threshold) → offline → (ping กลับมา) → online — ดู [[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy]] สำหรับเงื่อนไข threshold

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]] โดยตรง — ping ที่ validate ผ่านแล้วถูก publish เข้า queue กลางเท่านั้น (ดู [[structure/synthetic-iot-fleet-tracker/queue-architecture]]) เพื่อรักษาหลัก separation of concerns ไม่ให้ ingest layer รู้จัก concept ทางธุรกิจของ geofence เลย
