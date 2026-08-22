---
layer: deployment
tags: [environment, config, reference]
created: 2026-01-30
links:
  - "[[structure/module-payment]]"
  - "[[structure/module-refund]]"
  - "[[structure/module-auth]]"
---

# Environment Variables Reference

## payment-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PAYMENT_GATEWAY_API_KEY` | `sk_live_xxx` | secret ห้าม log |
| `PAYMENT_GATEWAY_URL` | `https://api.omise.co` | |
| `PAYMENT_GATEWAY_TIMEOUT_MS` | `30000` | ดู [[deployment/connection-timeout-tuning]] |

## refund-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `REFUND_SERVICE_URL` | `http://refund-service.internal:4002` | ใช้โดย order-service เรียกเข้ามา |
| `REFUND_STUCK_THRESHOLD_MIN` | `15` | เกินนี้ mark เป็น stuck |

## auth-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `JWT_SECRET` | (secret) | หมุนทุก 90 วัน |
| `JWT_ACCESS_TTL_SECONDS` | `900` | 15 นาที |

## กติกา

ตัวแปร secret (API key, JWT secret) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
