---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-07-10
links:
  - "[[business-logic/synthetic-content-delivery/cache-warming-policy]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| cache-coordinator | 2 | 10 | CPU > 70% หรือ query latency > 50ms |
| invalidation-dispatcher | 2 | 6 | queue depth > 500 |
| geo-router | 3 | 12 | request rate > 10,000 rps (latency-sensitive มาก) |

## Edge node capacity

จำนวน PoP ต้อง plan ล่วงหน้าและ scale ไม่ได้ real-time เหมือน software service — ช่วง event ขนาดใหญ่ต้อง pre-provision edge capacity ล่วงหน้าและทำ cache warming ดู [[business-logic/synthetic-content-delivery/cache-warming-policy]] สำหรับรายละเอียด
