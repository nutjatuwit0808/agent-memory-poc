---
layer: structure
tags: [anomaly, module, core, reference, identifiers]
created: 2026-08-04
links:
  - "[[structure/synthetic-energy-management/module-anomaly-detector]]"
  - "[[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy]]"
---

# anomaly-detector — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด anomaly-detector สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-energy-management/module-anomaly-detector]])

## Public functions
- `evaluateReading(reading: MeterReading, baseline: BaselineProfile): Promise<AnomalyResult>` — ประเมินว่าค่าที่อ่านได้ผิดปกติจาก baseline หรือไม่
- `raiseAlert(meterId: string, anomalyType: string): Promise<void>` — แจ้งเตือนทีมอาคารเมื่อพบความผิดปกติ
- `updateBaseline(meterId: string, window: TimeRange): Promise<BaselineProfile>` — คำนวณ baseline ใหม่จากข้อมูลย้อนหลัง

## Internal constants
- `ANOMALY_STDDEV_MULTIPLIER = 3`
- `BASELINE_WINDOW_DAYS = 30`

## Type

```ts
interface AnomalyResult {
  isAnomalous: boolean;
  deviationScore: number;
  anomalyType?: "spike" | "negative_value" | "flatline";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule ที่ [[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy]]
