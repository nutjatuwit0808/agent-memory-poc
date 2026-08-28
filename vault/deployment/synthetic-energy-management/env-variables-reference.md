---
layer: deployment
tags: [energy-management, gridsync, environment, config, reference]
created: 2026-01-16
links:
  - "[[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy]]"
---

# Environment Variables Reference — GridSync — ระบบบริหารพลังงานองค์กร

## meter-collector-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `METER_OFFLINE_THRESHOLD_MIN` | `15` |  |
| `READING_RETENTION_DAYS` | `730` |  |

## demand-response-controller-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `DEMAND_THRESHOLD_KW_DEFAULT` | `5000` | ดู [[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy]] |
| `LOAD_SHED_COOLDOWN_MIN` | `30` |  |

## anomaly-detector-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ANOMALY_STDDEV_MULTIPLIER` | `3` |  |
| `BASELINE_WINDOW_DAYS` | `30` |  |

## carbon-calculator-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `EMISSION_FACTOR_SOURCE` | `https://emission-factors.internal/v2` |  |
| `CARBON_REPORT_SCHEDULE_CRON` | `0 3 1 * *` |  |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
