---
layer: deployment
tags: [event-ticketing, ticketnode, environment, config, reference]
created: 2026-04-22
links:
  - "[[business-logic/synthetic-event-ticketing/hold-expiry-timeout-policy]]"
  - "[[business-logic/synthetic-event-ticketing/waitlist-release-batch-size-policy]]"
---

# Environment Variables Reference — TicketNode — ระบบจำหน่ายบัตรงานอีเวนต์

## seat-inventory-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SEAT_HOLD_DEFAULT_TTL_SECONDS` | `600` | ดู [[business-logic/synthetic-event-ticketing/hold-expiry-timeout-policy]] |
| `MAX_CONCURRENT_HOLDS_PER_BUYER` | `8` |  |

## waitlist-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `WAITLIST_OFFER_CLAIM_WINDOW_MIN` | `20` |  |
| `WAITLIST_RELEASE_BATCH_SIZE_DEFAULT` | `5` | ดู [[business-logic/synthetic-event-ticketing/waitlist-release-batch-size-policy]] |

## resale-marketplace-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `RESALE_PRICE_CAP_MULTIPLIER` | `1.1` |  |
| `RESALE_LISTING_EXPIRY_DAYS` | `7` |  |

## entry-scanner-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SCANNER_OFFLINE_CACHE_TTL_MIN` | `30` | รองรับกรณี network หน้างานไม่เสถียร |
| `GATE_HEARTBEAT_INTERVAL_SEC` | `10` |  |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
