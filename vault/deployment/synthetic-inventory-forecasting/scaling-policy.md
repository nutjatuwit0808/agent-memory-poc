---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-03-30
links:
  - "[[business-logic/synthetic-inventory-forecasting/model-retrain-policy]]"
  - "[[deployment/synthetic-inventory-forecasting/holiday-capacity-planning-runbook]]"
---

# Scaling Policy

## Autoscaling ของแต่ละ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| demand-model-runner | 4 | 20 | queue depth > 50 shard |
| feature-store | 2 | 10 | CPU > 70% |
| anomaly-flagger | 1 | 6 | CPU > 60% (เร่งขึ้นไวกว่าเพราะต้องเกือบ real-time) |

## ข้อจำกัดช่วงเทศกาล

การ scale software service ช่วยได้แค่ระดับ compute throughput ไม่ได้แก้ปัญหาความแม่นยำที่ตกลงช่วง high-volatility window — ดู [[business-logic/synthetic-inventory-forecasting/model-retrain-policy]] สำหรับข้อจำกัดด้าน model quality ที่ scaling แก้ไม่ได้ และ [[deployment/synthetic-inventory-forecasting/holiday-capacity-planning-runbook]] สำหรับการเตรียมตัวล่วงหน้า
