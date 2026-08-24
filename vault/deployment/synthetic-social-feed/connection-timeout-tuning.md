---
layer: deployment
tags: [timeout, infrastructure]
created: 2025-12-22
links:
  - "[[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]]"
  - "[[support-cases/synthetic-social-feed/case-7369]]"
---

# Connection Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure/connection เท่านั้น ไม่ใช่ business timeout ของการ refresh คะแนนจัดอันดับ — ดูเรื่องนั้นที่ [[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| API gateway → feed-ranker | 3s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| feed-ranker → database pool acquire | 2s | `pg-pool` config |
| notification-fanout → push provider | 5s | env `PUSH_PROVIDER_TIMEOUT_MS` |

## เหตุการณ์ที่เจอจริง

ดูเหตุการณ์ [[support-cases/synthetic-social-feed/case-7369]] ที่ connection pool เต็มจน request ใหม่ timeout เป็นลูกโซ่ทั้งระบบ
