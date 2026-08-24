---
layer: structure
tags: [ingest, module, core, reference, identifiers]
created: 2025-11-28
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy]]"
---

# gps-ingest — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด gps-ingest สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]])

## Public functions
- `ingestPing(deviceId: string, raw: RawPingPayload): Promise<void>` — รับ ping ดิบ validate โครงสร้างเบื้องต้น แล้ว publish เข้า queue
- `getLatestPosition(deviceId: string): Promise<PositionSnapshot | null>` — คืนตำแหน่งล่าสุดที่รู้จักของอุปกรณ์ ใช้ตอบ dashboard แบบ synchronous
- `markDeviceOffline(deviceId: string): Promise<void>` — เปลี่ยนสถานะอุปกรณ์เป็น offline เมื่อไม่มี ping เข้ามาเกิน threshold

## Internal constants
- `PING_VALIDATION_MAX_SKEW_SEC = 120`
- `DEVICE_OFFLINE_AFTER_MISSED_PINGS = 10`
- `INGEST_UDP_BUFFER_SIZE_KB = 64`

## Type

```ts
interface RawPingPayload {
  lat: number;
  lng: number;
  speedKph: number;
  headingDeg: number;
  fuelPct: number | null;
  deviceTimestamp: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy]]
