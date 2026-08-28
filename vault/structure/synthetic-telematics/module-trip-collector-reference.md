---
layer: structure
tags: [trip, module, core, reference, identifiers]
created: 2026-01-29
links:
  - "[[structure/synthetic-telematics/module-trip-collector]]"
  - "[[business-logic/synthetic-telematics/harsh-event-sensitivity-threshold-policy]]"
---

# trip-collector — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด trip-collector สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-telematics/module-trip-collector]])

## Public functions
- `ingestGpsPoint(deviceId: string, point: GpsPoint): Promise<void>` — รับจุดพิกัด GPS 1 จุด บันทึกเข้า trip ปัจจุบันหรือเริ่ม trip ใหม่
- `finalizeTrip(deviceId: string): Promise<string>` — ปิดเที่ยวการเดินทางปัจจุบันเมื่อรถหยุดนิ่งนานเกินเกณฑ์ คืน tripId
- `getTripDetail(tripId: string): Promise<TripDetail>` — ดึงรายละเอียดเที่ยวการเดินทางหนึ่งรวม harsh event ที่เกิดขึ้น

## Internal constants
- `TRIP_IDLE_TIMEOUT_MIN = 5`
- `GPS_TRACE_RETENTION_DAYS = 365`

## Type

```ts
interface GpsPoint {
  deviceId: string;
  timestamp: string;
  lat: number;
  lng: number;
  speedKmh: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการแบ่งเที่ยวการเดินทางที่ [[business-logic/synthetic-telematics/harsh-event-sensitivity-threshold-policy]]
