---
layer: structure
tags: [hvac, module, core, reference, identifiers]
created: 2026-07-23
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]]"
---

# hvac-controller — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด hvac-controller สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-smart-building/module-hvac-controller]])

## Public functions
- `setZoneSetpoint(zoneId: string, tempC: number, source: "auto" | "manual"): Promise<void>` — ตั้ง setpoint ของโซน พร้อม flag แหล่งที่มาเพื่อแยก override ของคนออกจากคำแนะนำอัตโนมัติ
- `readZoneTelemetry(zoneId: string): Promise<ZoneTelemetry>` — ดึงค่าอุณหภูมิ/ความชื้น/ตำแหน่ง damper ล่าสุดที่ cache ไว้
- `resolveDamperPosition(zoneId: string): DamperCommand` — คำนวณตำแหน่ง damper จาก setpoint ปัจจุบันเทียบกับอุณหภูมิจริง
- `reportSensorStale(zoneId: string, lastSeenMs: number): Promise<void>` — แจ้งว่า sensor ของโซนนี้ไม่ส่งค่าอัปเดตนานผิดปกติ

## Internal constants
- `ZONE_DEADBAND_C = 1.0`
- `MAX_SETPOINT_STEP_C = 2.0`
- `STALE_SENSOR_THRESHOLD_MS = 180000`

## Type

```ts
interface ZoneTelemetry {
  zoneId: string;
  tempC: number;
  humidityPct: number;
  damperPct: number;
  lastSensorMs: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่อง override ที่ [[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]]
