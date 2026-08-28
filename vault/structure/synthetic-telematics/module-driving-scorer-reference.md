---
layer: structure
tags: [scoring, module, core, reference, identifiers]
created: 2025-10-24
links:
  - "[[structure/synthetic-telematics/module-driving-scorer]]"
  - "[[business-logic/synthetic-telematics/score-recalculation-frequency-policy]]"
---

# driving-scorer — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด driving-scorer สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-telematics/module-driving-scorer]])

## Public functions
- `calculateTripScore(tripId: string): Promise<TripScore>` — คำนวณคะแนนของเที่ยวการเดินทางหนึ่ง
- `recalculateOverallScore(policyholderId: string): Promise<OverallScore>` — คำนวณคะแนนรวมของผู้ขับใหม่จากทุกเที่ยวในช่วงเวลาที่กำหนด
- `getScoreHistory(policyholderId: string, range: TimeRange): Promise<TripScore[]>` — คืนประวัติคะแนนย้อนหลัง

## Internal constants
- `HARSH_BRAKING_PENALTY_POINTS = 15`
- `SMOOTH_TRIP_BONUS_POINTS = 5`

## Type

```ts
interface TripScore {
  tripId: string;
  score: number;
  harshEventCount: number;
  calculatedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องความถี่การคำนวณใหม่ที่ [[business-logic/synthetic-telematics/score-recalculation-frequency-policy]]
