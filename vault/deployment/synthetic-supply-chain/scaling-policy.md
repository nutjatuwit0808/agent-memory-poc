---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-02-08
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| purchase-order-engine | 2 | 6 | CPU > 70% |
| goods-receipt-processor | 2 | 6 | queue depth > 200 |
| replenishment-trigger | 1 | 3 | ประเมินทุก 30 นาที — scale horizontal ไม่ช่วยเพราะเป็น scheduled evaluation |
| quality-inspection-gate | 1 | 4 | queue depth > 100 |

## ข้อจำกัด

replenishment-trigger ไม่ scale แบบ event-driven เพราะถ้า multiple instance evaluate พร้อมกันอาจ trigger PO ซ้ำได้ — ออกแบบให้รัน single instance แต่ใช้ lock เพื่อป้องกัน concurrent evaluation สำหรับ SKU เดิม
