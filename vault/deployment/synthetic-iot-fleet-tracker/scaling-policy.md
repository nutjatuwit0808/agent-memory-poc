---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-03-03
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| gps-ingest | 4 | 16 | ping rate > 15,000/s |
| geofence-engine | 2 | 10 | CPU > 65% |
| alert-dispatcher | 2 | 8 | WebSocket connection > 70% capacity (เข้มกว่าที่อื่นเพราะ latency-sensitive) |

## ข้อจำกัดของข้อมูลภายนอก

ความถี่ ping จริงถูกจำกัดโดยฮาร์ดแวร์อุปกรณ์และสัญญาณเครือข่ายมือถือ — การ scale software service เร็วขึ้นช่วยได้แค่ระดับการประมวลผล ไม่ได้เพิ่มความถี่ ping ที่ได้รับจริง ดู [[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy]] สำหรับข้อจำกัดนี้
