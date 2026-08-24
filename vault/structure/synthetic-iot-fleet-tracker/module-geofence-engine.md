---
layer: structure
tags: [geofence, module, core]
created: 2026-05-26
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
  - "[[structure/synthetic-iot-fleet-tracker/queue-architecture]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]]"
---

# Module: geofence-engine

ประเมินว่าตำแหน่งล่าสุดของยานพาหนะแต่ละคันอยู่ในโซนที่ลูกค้ากำหนดไว้หรือไม่ (เช่น เขตส่งของ, เขตห้ามเข้า) แล้ว publish event เข้า-ออกโซน แยกออกมาจาก gps-ingest ตั้งแต่กลางปี 2025 เพราะ logic การเทียบ polygon ซับซ้อนขึ้นเรื่อยๆ (โซนซ้อนกัน, โซนที่มีรูขาด) จนทำให้ ingest path ช้าลงถ้าคำนวณ inline

## ฟังก์ชันหลัก
- `evaluatePing(deviceId: string, position: PositionSnapshot): Promise<GeofenceEvalResult>` — เทียบตำแหน่งกับโซนที่เกี่ยวข้องทั้งหมด คืนรายการโซนที่เพิ่งเข้า/ออก
- `registerZone(customerId: string, polygon: GeoPolygon): Promise<string>` — สร้างโซนใหม่ คืน zoneId
- `listActiveZonesNear(lat: number, lng: number): Promise<Zone[]>` — คืนโซนที่อยู่ใกล้พิกัดที่ระบุ ใช้กรองก่อน evaluate เพื่อลดจำนวน polygon ที่ต้องเทียบ

## State

outside → (ping เข้า polygon) → inside → (ping ออก polygon) → outside — ดู [[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]] สำหรับเงื่อนไขกันสัญญาณ GPS กระตุก

## ความสัมพันธ์กับ module อื่น

subscribe `ping.received` จาก [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] โดยตรงผ่าน queue (ดู [[structure/synthetic-iot-fleet-tracker/queue-architecture]]) ไม่ query ตรงเข้า database ของ gps-ingest — [[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]] เป็นคนเดียวที่ query ข้าม event ของโมดูลนี้กับ ping ดิบพร้อมกัน
