---
layer: structure
tags: [inventory-forecasting, forecastiq, database, schema]
created: 2026-04-09
links:
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-inventory-forecasting/module-demand-model-runner]] ดูแล ได้แก่ `forecast_runs` (metadata ของแต่ละ batch run), `forecast_results` (ผลพยากรณ์ดิบต่อ SKU x store x week), และ `model_versions`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `forecast_results` | demand-model-runner | ผลดิบก่อนปรับฤดูกาล อัปเดตทุกคืน |
| `feature_vectors` | feature-store | feature ที่ป้อนโมเดล มี version + timestamp |
| `replenishment_recommendations` | replenishment-recommender | คำแนะนำเติมสินค้าที่ยังไม่ approve/approve แล้ว |
| `accuracy_metrics` | forecast-accuracy-tracker | WAPE/MAPE รายสัปดาห์ต่อ SKU/category |

ทุกตารางใช้ `sku_id` และ `store_id` เป็น composite key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายสัปดาห์แทน
