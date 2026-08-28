---
layer: structure
tags: [ml, scoring, module, core]
created: 2025-09-15
links:
  - "[[structure/synthetic-fraud-detection/module-velocity-tracker]]"
  - "[[structure/synthetic-fraud-detection/module-device-fingerprinter]]"
  - "[[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]]"
---

# Module: ml-scorer

ให้คะแนนความเสี่ยงของ signal ด้วย ML model ที่ train บน behavioral pattern ประวัติศาสตร์ model อัปเดตแบบ scheduled retrain ไม่ใช่ online learning เพื่อให้สามารถ validate model ก่อน deploy ได้ครบถ้วน แยกออกมาเป็น service เพื่อให้ model upgrade ไม่กระทบ rule-engine

## ฟังก์ชันหลัก
- `scoreSignal(signal: Signal): Promise<MLScore>` — ให้คะแนน 0-100 พร้อม feature contribution ที่ใช้ตัดสิน
- `getModelVersion(): Promise<ModelInfo>` — คืน version ของ model ที่ deploy อยู่ปัจจุบัน พร้อม metadata เช่น precision และ recall บน validation set
- `runShadowScoring(signal: Signal, modelVersion: string): Promise<MLScore>` — รัน model version อื่นแบบ shadow mode เพื่อเปรียบเทียบ score ก่อน promote เป็น production

## State

signal_received → features_extracted → model_inference → score_published

## ความสัมพันธ์กับ module อื่น

ใช้ feature จาก [[structure/synthetic-fraud-detection/module-velocity-tracker]] และ [[structure/synthetic-fraud-detection/module-device-fingerprinter]] แบบ synchronous call ระหว่าง feature extraction ถ้า call เหล่านี้ช้าหรือ fail จะใช้ค่า fallback เพื่อไม่ให้ scoring latency เกิน SLA ดู [[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]]
