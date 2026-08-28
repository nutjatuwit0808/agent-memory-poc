---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-04-03
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Trigger |
|---|---|---|---|
| asset-registry | 2 | 6 | CPU > 70% |
| license-pool-manager | 2 | 4 | RPS > 500 |
| depreciation-engine | 1 | 3 | ช่วง batch job รายคืน |
| disposal-workflow | 1 | 2 | Queue depth > 50 |

## Batch job window

depreciation-engine รัน batch คำนวณ schedule ประจำปีในช่วงตี 2-4 ซึ่งเป็นช่วง load ต่ำที่สุด ควบคุม concurrency ไม่ให้กระทบ service อื่นในช่วง business hour
