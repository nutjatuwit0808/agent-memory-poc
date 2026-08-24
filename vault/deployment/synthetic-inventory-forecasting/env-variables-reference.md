---
layer: deployment
tags: [inventory-forecasting, forecastiq, environment, config, reference]
created: 2025-11-10
links:
  - "[[business-logic/synthetic-inventory-forecasting/forecast-horizon-policy]]"
  - "[[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]]"
  - "[[business-logic/synthetic-inventory-forecasting/replenishment-approval-policy]]"
  - "[[business-logic/synthetic-inventory-forecasting/anomaly-threshold-policy]]"
---

# Environment Variables Reference — ForecastIQ — ระบบพยากรณ์ความต้องการสินค้าคงคลัง

## demand-model-runner-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `MODEL_TIMEOUT_MS` | `180000` | ดู [[business-logic/synthetic-inventory-forecasting/forecast-horizon-policy]] |
| `FORECAST_HORIZON_WEEKS` | `12` |  |
| `MODEL_RUNNER_DB_URL` | `postgres://forecast-db.internal:5432/forecast` | secret ห้าม log |

## feature-store-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `FEATURE_TTL_HOURS` | `26` | ดู [[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]] |
| `MAX_FEATURE_LAG_HOURS` | `30` |  |

## replenishment-recommender-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `DEFAULT_SAFETY_STOCK_DAYS` | `7` |  |
| `REPLENISHMENT_APPROVAL_THRESHOLD_USD` | `50000` | เกินนี้ต้องอนุมัติตาม [[business-logic/synthetic-inventory-forecasting/replenishment-approval-policy]] |

## anomaly-flagger-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ANOMALY_ZSCORE_THRESHOLD` | `2.5` | ดู [[business-logic/synthetic-inventory-forecasting/anomaly-threshold-policy]] |
| `ANOMALY_SUPPRESS_WINDOW_HOURS` | `72` | หลัง suppress แล้วไม่ flag ซ้ำ SKU เดิมภายในช่วงนี้ |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
