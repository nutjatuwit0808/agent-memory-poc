---
layer: deployment
tags: [scaling, infrastructure]
created: 2025-12-10
links:
  - "[[structure/synthetic-quality-control/module-quarantine-manager]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up trigger |
|---|---|---|---|
| measurement-collector | 2 | 10 | ingest queue > 1000/min |
| spc-analyzer | 2 | 6 | CPU > 70% |
| batch-inspector | 2 | 4 | pending batch queue > 50 |

## ข้อจำกัด

[[structure/synthetic-quality-control/module-quarantine-manager]] ไม่ scale เกิน 2 replica เพราะ hold state ต้องไม่กระจาย — ใช้ single leader pattern แทน
