---
layer: deployment
tags: [scaling, infrastructure]
created: 2025-11-17
links:
  - "[[structure/synthetic-recruitment-ats/module-background-check-integration]]"
  - "[[business-logic/synthetic-recruitment-ats/background-check-sla-policy]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| resume-parser | 2 | 10 | queue depth > 200 (พุ่งสูงช่วง hiring surge window) |
| candidate-pipeline-tracker | 2 | 6 | CPU > 70% |
| interview-scheduler | 1 | 4 | CPU > 60% (latency-sensitive เพราะ sync ปฏิทินภายนอก) |

## ข้อจำกัดจาก Vendor ภายนอก

[[structure/synthetic-recruitment-ats/module-background-check-integration]] scale ฝั่งซอฟต์แวร์ได้ แต่ throughput จริงถูกจำกัดด้วย rate limit ของ vendor เอง — scale service เพิ่มช่วยแค่การ queue คำขอรอส่ง ไม่ได้ทำให้ vendor ประมวลผลเร็วขึ้น ดู [[business-logic/synthetic-recruitment-ats/background-check-sla-policy]]
