---
layer: deployment
tags: [marketing-automation, wavecast, environment, config, reference]
created: 2025-11-16
links:
  - "[[business-logic/synthetic-marketing-automation/campaign-scheduling-window-policy]]"
  - "[[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]]"
  - "[[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]]"
---

# Environment Variables Reference — Wavecast — ระบบ Email/Campaign Marketing Automation

## campaign-builder-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `CAMPAIGN_MIN_SCHEDULE_LEAD_MINUTES` | `15` | ดู [[business-logic/synthetic-marketing-automation/campaign-scheduling-window-policy]] |
| `CAMPAIGN_DB_URL` | `postgres://campaign-db.internal:5432/campaign` | secret ห้าม log |

## send-scheduler-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SEND_BATCH_SIZE` | `5000` |  |
| `SEND_RATE_LIMIT_PER_MINUTE` | `50000` | ดู [[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]] |

## deliverability-monitor-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `BOUNCE_RATE_PAUSE_THRESHOLD_PCT` | `5` | เกินนี้สั่ง pause อัตโนมัติ |
| `ESP_REPUTATION_API_KEY` | `esp_live_xxx` | secret |

## consent-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `CONSENT_CACHE_TTL_SECONDS` | `30` |  |
| `UNSUBSCRIBE_HONOR_SLA_HOURS` | `24` | ดู [[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]] |
| `CONSENT_DB_URL` | `postgres://consent-db.internal:5432/consent` | secret ห้าม log |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
