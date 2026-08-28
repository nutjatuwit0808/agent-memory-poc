---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-08-15
---

# Scaling Policy

## Autoscaling ของแต่ละ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| order-router | 3 | 12 | request rate > 500 rps |
| driver-dispatch | 2 | 10 | connection count > 3000 |
| eta-estimator | 2 | 8 | CPU > 65% |
| surge-pricer | 2 | 6 | CPU > 60% |

## Lunch peak pre-scaling

ทุกวันเวลา 11:00 (30 นาทีก่อน peak) ระบบ pre-scale service หลักขึ้นเป็น 70% ของ max replica โดยอัตโนมัติ เพื่อไม่ให้ autoscaler lag ทัน traffic ที่พุ่งเร็ว
