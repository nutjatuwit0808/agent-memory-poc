---
layer: structure
tags: [energy, module, core, reference, identifiers]
created: 2025-12-21
links:
  - "[[structure/synthetic-smart-building/module-energy-optimizer]]"
  - "[[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy]]"
---

# energy-optimizer — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด energy-optimizer สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-smart-building/module-energy-optimizer]])

## Public functions
- `computeOptimalSetpoint(zoneId: string, occupancy: OccupancyState): SetpointRecommendation` — คำนวณ setpoint แนะนำจากราคาไฟปัจจุบันและสถานะ occupancy
- `applyDemandResponseCurve(recommendation: SetpointRecommendation, event: DrEvent): SetpointRecommendation` — ปรับคำแนะนำตามสัญญาณ demand response จากการไฟฟ้า
- `publishRecommendation(rec: SetpointRecommendation): Promise<void>` — ส่งคำแนะนำเข้า queue ให้ hvac-controller รับไปพิจารณา

## Internal constants
- `OPT_INTERVAL_MS = 300000`
- `COMFORT_BAND_C = 1.5`
- `MAX_DAILY_ADJUSTMENTS_PER_ZONE = 12`

## Type

```ts
interface SetpointRecommendation {
  zoneId: string;
  tempC: number;
  reason: "cost_saving" | "demand_response" | "comfort_relax";
  validUntilMs: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการชนกับ manual override ที่ [[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy]]
