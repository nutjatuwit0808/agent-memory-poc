---
layer: structure
tags: [meter, module, core, reference, identifiers]
created: 2026-05-04
links:
  - "[[structure/synthetic-energy-management/module-meter-collector]]"
  - "[[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy]]"
---

# meter-collector — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด meter-collector สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-energy-management/module-meter-collector]])

## Public functions
- `ingestReading(meterId: string, reading: MeterReading): Promise<void>` — รับข้อมูลดิบ 1 จุดจาก meter บันทึกเป็น time-series
- `getReadings(meterId: string, range: TimeRange): Promise<MeterReading[]>` — ดึงข้อมูลดิบในช่วงเวลาที่กำหนด
- `checkMeterHealth(meterId: string): Promise<MeterHealthStatus>` — ตรวจสถานะ meter ว่ายังส่งข้อมูลปกติหรือขาดหายไปนานแค่ไหน

## Internal constants
- `METER_OFFLINE_THRESHOLD_MIN = 15`
- `READING_RETENTION_DAYS = 730`

## Type

```ts
interface MeterReading {
  meterId: string;
  timestamp: string;
  value: number;
  unit: "kWh" | "m3" | "L";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการตรวจจับ meter ขาดการเชื่อมต่อที่ [[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy]]
