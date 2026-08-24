---
layer: deployment
tags: [social-feed, pulsefeed, environment, config, reference]
created: 2026-08-06
links:
  - "[[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]]"
  - "[[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]]"
  - "[[business-logic/synthetic-social-feed/follow-request-privacy-policy]]"
---

# Environment Variables Reference — PulseFeed — ระบบจัดอันดับ Feed โซเชียล

## feed-ranker-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `FEED_SCORE_CACHE_TTL_HOURS` | `6` | ดู [[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]] |
| `FEED_PAGE_SIZE` | `20` |  |
| `MAX_RANKING_CANDIDATES` | `500` | จำนวนโพสต์สูงสุดที่พิจารณาต่อการจัดอันดับ 1 ครั้ง |

## notification-fanout-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `FANOUT_BATCH_SIZE` | `1000` |  |
| `CELEBRITY_FOLLOWER_THRESHOLD` | `100000` | เกินนี้เข้า throttling พิเศษ ดู [[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]] |
| `FANOUT_QUEUE_URL` | `amqp://fanout-queue.internal:5672` | secret ห้าม log |

## content-moderation-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `MODERATION_AUTO_REMOVE_THRESHOLD` | `0.95` | confidence ที่ auto-remove ได้เลยไม่ต้องรอคนตรวจ |
| `MODERATION_REVIEW_QUEUE_MAX_DEPTH` | `2000` |  |

## follow-graph-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `FOLLOW_GRAPH_DB_URL` | `postgres://follow-db.internal:5432/follow` | secret ห้าม log |
| `PRIVATE_ACCOUNT_APPROVAL_TIMEOUT_HOURS` | `72` | ดู [[business-logic/synthetic-social-feed/follow-request-privacy-policy]] |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
