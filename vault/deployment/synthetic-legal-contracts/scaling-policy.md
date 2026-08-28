---
layer: deployment
tags: [scaling, infrastructure]
created: 2025-10-05
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| approval-router | 2 | 6 | latency p95 > 150ms |
| signature-orchestrator | 2 | 8 | queue depth > 200 |
| renewal-monitor | 1 | 2 | ไม่ scale ตาม load เพราะเป็น scheduled job ล้วนๆ |

## ข้อจำกัดที่ต้องระวัง

approval-router ต้องมี availability สูงตลอดเวลาทำการ เพราะสัญญาที่ค้างอยู่ในขั้นตอนอนุมัตินานเกินไปกระทบ business timeline ของดีลได้โดยตรง
