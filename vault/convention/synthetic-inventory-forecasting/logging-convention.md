---
layer: convention
tags: [logging, observability]
created: 2025-09-17
links:
  - "[[deployment/synthetic-inventory-forecasting/monitoring-alerts]]"
  - "[[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ batch พยากรณ์ต้องมี `batchId` เสมอ เพื่อไล่ log ข้าม service ได้ (demand-model-runner → seasonality-adjuster → replenishment-recommender) ดู [[deployment/synthetic-inventory-forecasting/monitoring-alerts]]

## ระดับ log

feature ที่ stale ตาม [[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]] log เป็น `warning` ไม่ใช่ `error` เพราะเป็นสถานการณ์ที่ระบบจัดการเองได้ ไม่ต้อง page คนตอนกลางดึก
