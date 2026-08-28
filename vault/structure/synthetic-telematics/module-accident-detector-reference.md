---
layer: structure
tags: [accident, module, core, reference, identifiers]
created: 2026-05-27
links:
  - "[[structure/synthetic-telematics/module-accident-detector]]"
  - "[[business-logic/synthetic-telematics/accident-evidence-retention-policy]]"
---

# accident-detector — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด accident-detector สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-telematics/module-accident-detector]])

## Public functions
- `evaluateHarshEvent(event: HarshEvent): Promise<AccidentAssessment>` — ประเมินว่าเหตุการณ์ความเร่งผิดปกติมีแนวโน้มเป็นอุบัติเหตุจริงหรือไม่
- `raiseAccidentAlert(tripId: string, evidence: AccidentEvidence): Promise<string>` — แจ้งเตือนทีมช่วยเหลือฉุกเฉิน คืน alertId
- `retainEvidence(alertId: string): Promise<void>` — เก็บหลักฐาน (GPS trace ช่วงเกิดเหตุ, sensor data) ไว้สำหรับการเคลมประกัน

## Internal constants
- `ACCIDENT_DECELERATION_THRESHOLD_G = 4.0`
- `ACCIDENT_ALERT_CONFIRM_WINDOW_SEC = 30`

## Type

```ts
interface AccidentAssessment {
  isLikelyAccident: boolean;
  confidenceScore: number;
  decelerationG: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการเก็บหลักฐานที่ [[business-logic/synthetic-telematics/accident-evidence-retention-policy]]
