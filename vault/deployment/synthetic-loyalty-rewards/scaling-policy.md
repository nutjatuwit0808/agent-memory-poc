---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-02-02
links:
  - "[[deployment/synthetic-loyalty-rewards/expiry-job-scheduling-runbook]]"
---

# Scaling Policy

## Autoscaling

| Service | Min replica | Max replica | Scale-up trigger |
|---|---|---|---|
| points-ledger | 3 | 12 | CPU > 70% หรือ write QPS > 500 |
| redemption-engine | 2 | 8 | pending redemption > 200 |
| expiry-scheduler | 1 | 1 | ไม่ scale — singleton batch |

## Batch window

expiry-scheduler และ tier batch รันช่วง 00:00-02:00 ซึ่งเป็นช่วง traffic ต่ำ ถ้า job ใดใช้เวลาเกิน 2 ชั่วโมงให้ alert ทีมทันที ดู [[deployment/synthetic-loyalty-rewards/expiry-job-scheduling-runbook]]
