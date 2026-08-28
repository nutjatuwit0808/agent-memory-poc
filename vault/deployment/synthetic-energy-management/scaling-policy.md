---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-04-14
links:
  - "[[support-cases/synthetic-energy-management/case-4952]]"
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| meter-collector | 4 | 20 | ingest queue depth > 1000 |
| demand-response-controller | 2 | 6 | latency p95 > 100ms |
| anomaly-detector | 2 | 8 | processing lag > 30s |

## ข้อจำกัดที่ต้องระวัง

meter-collector ต้อง scale ล่วงหน้าก่อน peak hour ที่คาดเดาได้ทุกวัน ไม่รอ autoscale ตอบสนองแบบ reactive อย่างเดียว — บทเรียนจาก [[support-cases/synthetic-energy-management/case-4952]]
