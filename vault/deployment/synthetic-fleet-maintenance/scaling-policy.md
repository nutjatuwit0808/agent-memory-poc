---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-03-22
links:
  - "[[structure/synthetic-fleet-maintenance/module-reorder-trigger]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up trigger |
|---|---|---|---|
| maintenance-scheduler | 2 | 4 | check queue > 500 vehicles/min |
| work-order-manager | 2 | 8 | active work order queue > 200 |
| parts-inventory | 2 | 6 | deduction rate > 100/min |

## ข้อจำกัด

[[structure/synthetic-fleet-maintenance/module-reorder-trigger]] ไม่ scale เกิน 2 replica เพราะ idempotency check ต้องมี single source of truth — scale ขึ้นต้องมี distributed lock เพิ่มก่อน
