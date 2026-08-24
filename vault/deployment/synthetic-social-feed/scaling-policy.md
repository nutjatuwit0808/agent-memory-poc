---
layer: deployment
tags: [scaling, infrastructure]
created: 2025-10-17
links:
  - "[[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]]"
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| feed-ranker | 4 | 20 | CPU > 65% (latency-sensitive) |
| notification-fanout | 2 | 16 | queue depth > 5000 |
| content-moderation-service | 3 | 12 | review queue > 70% max |

## ข้อจำกัดจากบุคคลที่สาม

push notification provider ภายนอกมี rate limit ของตัวเอง — scale service ของเราเพิ่มไม่ช่วยถ้าติด rate limit ฝั่ง provider ดู [[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]] สำหรับข้อจำกัดนี้
