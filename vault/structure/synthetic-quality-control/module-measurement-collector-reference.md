---
layer: structure
tags: [measurement, module, core, reference, identifiers]
created: 2026-03-15
links:
  - "[[structure/synthetic-quality-control/module-measurement-collector]]"
  - "[[business-logic/synthetic-quality-control/calibration-interval-policy]]"
---

# measurement-collector — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด measurement-collector สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-quality-control/module-measurement-collector]])

## Public functions
- `ingestMeasurement(instrumentId: string, runId: string, value: number, unit: string): Promise<MeasurementId>` — รับข้อมูลวัดจากเซ็นเซอร์ ตรวจ calibration status ก่อนบันทึก
- `getCalibrationStatus(instrumentId: string): CalibrationStatus` — คืนสถานะ calibration ล่าสุดของเครื่องมือวัดตัวนั้น
- `listMeasurementsForRun(runId: string, limit?: number): Promise<Measurement[]>` — ดึงข้อมูลวัดทั้งหมดของ production run ที่ระบุ
- `flagInstrumentOverdue(instrumentId: string): Promise<void>` — mark เครื่องมือว่า calibration เกินกำหนด หยุดรับข้อมูลจากตัวนั้นชั่วคราว

## Internal constants
- `CALIBRATION_GRACE_PERIOD_HOURS = 4`
- `MAX_MEASUREMENT_BATCH_SIZE = 500`
- `INSTRUMENT_INGEST_RATE_LIMIT_PER_SEC = 200`

## Type

```ts
interface Measurement {
  measurementId: string;
  instrumentId: string;
  runId: string;
  value: number;
  unit: string;
  timestamp: string;  // ISO 8601
  calibrationValid: boolean;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-quality-control/calibration-interval-policy]]
