---
layer: structure
tags: [geofence, module, core, reference, identifiers]
created: 2026-02-23
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]]"
---

# geofence-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด geofence-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]])

## Public functions
- `evaluatePing(deviceId: string, position: PositionSnapshot): Promise<GeofenceEvalResult>` — เทียบตำแหน่งกับโซนที่เกี่ยวข้องทั้งหมด คืนรายการโซนที่เพิ่งเข้า/ออก
- `registerZone(customerId: string, polygon: GeoPolygon): Promise<string>` — สร้างโซนใหม่ คืน zoneId
- `listActiveZonesNear(lat: number, lng: number): Promise<Zone[]>` — คืนโซนที่อยู่ใกล้พิกัดที่ระบุ ใช้กรองก่อน evaluate เพื่อลดจำนวน polygon ที่ต้องเทียบ

## Internal constants
- `GEOFENCE_DEBOUNCE_PINGS = 3`
- `MAX_ZONES_PER_CUSTOMER = 500`

## Type

```ts
interface GeofenceEvalResult {
  deviceId: string;
  entered: string[];
  exited: string[];
  evaluatedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการกันสัญญาณกระตุกที่ [[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]]
