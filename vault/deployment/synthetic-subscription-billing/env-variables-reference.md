---
layer: deployment
tags: [subscription-billing, recurflow, environment, config, reference]
created: 2025-12-30
links:
  - "[[business-logic/synthetic-subscription-billing/proration-method-selection-policy]]"
  - "[[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy]]"
---

# Environment Variables Reference — RecurFlow — ระบบบริหารรายได้ประจำสำหรับ SaaS

## plan-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PLAN_CHANGE_COOLDOWN_HOURS` | `24` |  |
| `PLAN_HISTORY_RETENTION_YEARS` | `7` |  |

## proration-calculator-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PRORATION_ROUNDING_PRECISION` | `2` |  |
| `MIN_PRORATION_AMOUNT_THB` | `1` | ดู [[business-logic/synthetic-subscription-billing/proration-method-selection-policy]] |

## dunning-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `DUNNING_MAX_RETRY_COUNT` | `3` |  |
| `DUNNING_RETRY_INTERVAL_DAYS` | `3` | ดู [[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy]] |

## usage-meter-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `USAGE_RECORD_RETENTION_MONTHS` | `24` |  |
| `USAGE_THRESHOLD_ALERT_PERCENT` | `80` |  |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
