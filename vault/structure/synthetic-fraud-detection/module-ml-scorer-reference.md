---
layer: structure
tags: [ml, scoring, module, core, reference, identifiers]
created: 2026-05-13
links:
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
  - "[[business-logic/synthetic-fraud-detection/score-threshold-policy]]"
---

# ml-scorer — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด ml-scorer สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-fraud-detection/module-ml-scorer]])

## Public functions
- `scoreSignal(signal: Signal): Promise<MLScore>` — ให้คะแนน 0-100 พร้อม feature contribution ที่ใช้ตัดสิน
- `getModelVersion(): Promise<ModelInfo>` — คืน version ของ model ที่ deploy อยู่ปัจจุบัน พร้อม metadata เช่น precision และ recall บน validation set
- `runShadowScoring(signal: Signal, modelVersion: string): Promise<MLScore>` — รัน model version อื่นแบบ shadow mode เพื่อเปรียบเทียบ score ก่อน promote เป็น production

## Internal constants
- `SCORING_TIMEOUT_MS = 120`
- `HIGH_RISK_THRESHOLD = 75`
- `MODEL_RETRAIN_INTERVAL_DAYS = 14`

## Type

```ts
interface MLScore {
  eventId: string;
  score: number; // 0-100
  confidence: "high" | "medium" | "low";
  topFeatures: { name: string; contribution: number }[];
  modelVersion: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง score threshold ที่ [[business-logic/synthetic-fraud-detection/score-threshold-policy]]
