---
layer: deployment
tags: [chat-support-bot, helploop, environment, config, reference]
created: 2026-04-27
links:
  - "[[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]]"
  - "[[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy]]"
  - "[[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]]"
  - "[[business-logic/synthetic-chat-support-bot/rate-limit-policy]]"
---

# Environment Variables Reference — HelpLoop — แพลตฟอร์ม Chat Support Bot

## intent-classifier-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `INTENT_CONFIDENCE_MIN_THRESHOLD` | `0.72` | ดู [[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]] |
| `CLASSIFY_TIMEOUT_MS` | `800` |  |

## conversation-state-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `STALE_CONVERSATION_THRESHOLD_MIN` | `30` | ดู [[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy]] |
| `STATE_DB_URL` | `postgres://conv-db.internal:5432/conversations` | secret ห้าม log |

## handoff-router-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `HANDOFF_QUEUE_ALERT_THRESHOLD_MIN` | `5` | ดู [[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]] |
| `HANDOFF_MAX_QUEUE_DEPTH` | `150` | เกินนี้เริ่ม throttle การรับ handoff ใหม่ |

## rate-limiter-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `RATE_LIMIT_BUCKET_CAPACITY` | `30` | จำนวนข้อความสูงสุดต่อ bucket ต่อ account |
| `RATE_LIMIT_REFILL_PER_MIN` | `10` | ดู [[business-logic/synthetic-chat-support-bot/rate-limit-policy]] |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
