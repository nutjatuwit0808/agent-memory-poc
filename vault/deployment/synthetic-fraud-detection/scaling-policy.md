---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-05-29
---

# Scaling Policy

## Autoscaling ของแต่ละ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| signal-collector | 3 | 15 | event rate > 10,000 eps |
| rule-engine | 2 | 10 | CPU > 70% |
| ml-scorer | 3 | 12 | latency p95 > 80ms |
| case-manager | 2 | 8 | queue depth > 200 |

## Scoring latency SLA

target latency สำหรับ end-to-end fraud decision คือ < 200ms (p99) เพราะ client รอ response ก่อน allow/block user action ทำให้ scaling ml-scorer เป็น priority สูงสุดใน scaling budget
