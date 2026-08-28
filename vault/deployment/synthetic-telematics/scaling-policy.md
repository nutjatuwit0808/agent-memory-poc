---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-02-01
links:
  - "[[support-cases/synthetic-telematics/case-5613]]"
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| trip-collector | 4 | 20 | ingest queue depth > 1000 |
| accident-detector | 3 | 10 | latency p95 > 50ms |
| driving-scorer | 2 | 8 | processing lag > 60s |

## ข้อจำกัดที่ต้องระวัง

accident-detector ต้องมี latency ต่ำที่สุดตลอดเวลา ไม่ใช่แค่ scale ตาม load เพราะความเร็วในการตัดสินใจมีผลต่อความปลอดภัยผู้ขับโดยตรง — บทเรียนจาก [[support-cases/synthetic-telematics/case-5613]] ที่แสดงว่าการไม่ scale ล่วงหน้าส่งผลกระทบต่อผู้ใช้จริง
