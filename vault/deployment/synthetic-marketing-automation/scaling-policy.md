---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-03-02
links:
  - "[[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]]"
---

# Scaling Policy

## Autoscaling

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| send-scheduler | 3 | 12 | queue depth > 500 |
| segment-engine | 1 | 6 | CPU > 70% |
| template-renderer | 2 | 10 | request rate > 2000/min |

## ข้อจำกัดของ rate limit ภายนอก

การ scale software service ช่วยได้แค่ระดับ throughput ในการเตรียมและประมวลผล ไม่ได้เพิ่มเพดานการส่งจริงที่ ESP กำหนด ดู [[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]] สำหรับข้อจำกัดนี้
