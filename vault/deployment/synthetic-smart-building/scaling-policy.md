---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-05-26
links:
  - "[[business-logic/synthetic-smart-building/building-zone-priority-policy]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| hvac-controller | 2 | 6 | CPU > 65% (latency-sensitive เพราะสั่งฮาร์ดแวร์โดยตรง) |
| occupancy-sensor-hub | 2 | 8 | ingest rate > 5000 event/s |
| energy-optimizer | 1 | 3 | batch job ไม่ latency-sensitive |

## ข้อจำกัดทางกายภาพ

จำนวน edge gateway ต่ออาคารคงที่ตามฮาร์ดแวร์ที่ติดตั้งจริง scale ไม่ได้แบบซอฟต์แวร์ — การ scale service ฝั่ง cloud ช่วยได้แค่ระดับการประมวลผล ไม่ได้เพิ่มแบนด์วิดท์ของ edge gateway ดู [[business-logic/synthetic-smart-building/building-zone-priority-policy]] สำหรับข้อจำกัดคล้ายกันฝั่งไฟฟ้าสำรอง
