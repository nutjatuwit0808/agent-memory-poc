---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-06-09
links:
  - "[[business-logic/synthetic-warehouse-robotics/peak-hour-throttling-policy]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| task-scheduler | 2 | 8 | queue depth > 300 |
| inventory-sync | 1 | 4 | CPU > 70% |
| picking-engine | 2 | 6 | CPU > 60% (เข้มกว่าที่อื่นเพราะ latency-sensitive) |

## ข้อจำกัดทางกายภาพ

จำนวนหุ่นยนต์จริงและหัวชาร์จ scale ไม่ได้แบบซอฟต์แวร์ — ช่วง peak window การ scale software service เร็วขึ้นช่วยได้แค่ระดับ queue processing ไม่ได้เพิ่มกำลังการหยิบจริง ดู [[business-logic/synthetic-warehouse-robotics/peak-hour-throttling-policy]] สำหรับข้อจำกัดนี้
