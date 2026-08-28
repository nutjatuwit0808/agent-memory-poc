---
layer: deployment
tags: [scaling, infrastructure]
created: 2025-12-30
links:
  - "[[support-cases/synthetic-customer-segmentation/case-3920]]"
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Trigger |
|---|---|---|---|
| event-ingester | 3 | 20 | Queue lag > 1h |
| segment-builder | 1 | 4 | CPU > 70% |
| membership-refresher | 1 | 3 | ช่วง batch job รายคืน |
| channel-exporter | 2 | 6 | Export queue depth > 100 |

## Peak event period

ช่วง shopping festival หรือ promotion ใหญ่ ให้ pre-scale event-ingester ล่วงหน้า 1 ชั่วโมงก่อน event เริ่ม — บทเรียนจาก [[support-cases/synthetic-customer-segmentation/case-3920]]
