---
layer: structure
tags: [inventory-forecasting, forecastiq, queue, async]
created: 2026-03-03
links:
  - "[[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]]"
  - "[[structure/synthetic-inventory-forecasting/module-anomaly-flagger]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `forecast.completed`, `forecast.failed`, `feature.batch_written`, `anomaly.flagged`, `replenishment.recommended` — [[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]] subscribe `forecast.completed` เพื่อเริ่มปรับค่าฤดูกาลทันทีที่ raw forecast เสร็จ ไม่ต้อง poll

[[structure/synthetic-inventory-forecasting/module-anomaly-flagger]] subscribe ทั้ง `forecast.completed` และ actual sales feed จาก POS เพื่อเทียบ residual แบบเกือบ real-time โดยไม่ผูกกับรอบ batch คืนเดียว ออกแบบแบบนี้เพื่อให้จับความผิดปกติของยอดขายจริงได้เร็วกว่าการรอ batch พยากรณ์รอบถัดไป
