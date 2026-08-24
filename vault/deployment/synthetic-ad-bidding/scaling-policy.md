---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-07-09
links:
  - "[[business-logic/synthetic-ad-bidding/bid-timeout-policy]]"
  - "[[support-cases/synthetic-ad-bidding/case-9755]]"
---

# Scaling Policy

## Autoscaling

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| bid-request-handler | 4 | 20 | p99 latency > 70ms |
| auction-engine | 4 | 16 | CPU > 60% (เข้มกว่าที่อื่นเพราะ latency-sensitive) |
| fraud-filter | 2 | 10 | CPU > 70% |
| win-notice-processor | 2 | 6 | queue depth > 1000 |

## ข้อจำกัดช่วง peak

การ scale software service เร็วขึ้นช่วย throughput ได้ แต่ latency ภายใน time budget ที่แคบมาก (ดู [[business-logic/synthetic-ad-bidding/bid-timeout-policy]]) ไม่ได้ดีขึ้นจากการเพิ่ม replica เสมอไป ถ้า downstream call เองช้าอยู่แล้ว ดู [[support-cases/synthetic-ad-bidding/case-9755]] เป็นตัวอย่าง
