---
layer: structure
tags: [anomaly, module]
created: 2026-03-19
links:
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
  - "[[structure/synthetic-inventory-forecasting/queue-architecture]]"
  - "[[business-logic/synthetic-inventory-forecasting/anomaly-threshold-policy]]"
---

# Module: anomaly-flagger

เฝ้าระวังส่วนต่าง (residual) ระหว่างยอดขายจริงกับพยากรณ์แบบเกือบ real-time เพื่อแยกแยะว่าเป็น "demand shift จริง" ที่ควรให้โมเดล adapt หรือเป็น "ปัญหาคุณภาพข้อมูล" ที่ต้องแก้ที่ต้นทางแทน

## ฟังก์ชันหลัก
- `evaluateResidual(skuId: string, storeId: string, weekStart: string): Promise<AnomalyEvaluation>` — คำนวณ z-score ของส่วนต่างระหว่างจริงกับพยากรณ์
- `flagAnomaly(skuId: string, storeId: string, reason: AnomalyReason): Promise<string>` — สร้าง anomaly record ใหม่ คืน anomalyId
- `suppressFlag(anomalyId: string, reviewerId: string, resolution: string): Promise<void>` — ปิด flag หลังคนตรวจสอบแล้วว่าไม่ต้อง action เพิ่ม

## ความสัมพันธ์กับ module อื่น

subscribe ทั้ง event `forecast.completed` จาก [[structure/synthetic-inventory-forecasting/module-demand-model-runner]] และ actual sales feed จาก POS โดยตรง (ดู [[structure/synthetic-inventory-forecasting/queue-architecture]]) — threshold ที่ใช้ตัดสิน anomaly กำหนดโดย [[business-logic/synthetic-inventory-forecasting/anomaly-threshold-policy]] ซึ่งต่างกันตาม volatility ของแต่ละ category
