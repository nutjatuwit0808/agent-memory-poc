---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-05-05
links:
  - "[[business-logic/synthetic-analytics-pipeline/backfill-load-policy]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| ingest-connector | 3 | 12 | active extract jobs > 200 |
| transform-engine | 2 | 10 | CPU > 70% |
| warehouse-loader | 2 | 6 | connection pool utilization > 80% (เข้มกว่าที่อื่นเพราะเป็น bottleneck ของทั้งระบบ) |

## ข้อจำกัดของ Warehouse

warehouse มี write throughput จำกัดตาม connection pool ที่ตกลงกับผู้ให้บริการ — การ scale software service เร็วขึ้นช่วยได้แค่ระดับการเตรียมข้อมูลก่อนโหลด ไม่ได้เพิ่มความเร็วการเขียนจริงเข้า warehouse ดู [[business-logic/synthetic-analytics-pipeline/backfill-load-policy]] สำหรับข้อจำกัดนี้
