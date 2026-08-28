---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-11-04
links:
  - "[[structure/synthetic-food-delivery/module-surge-pricer]]"
  - "[[structure/synthetic-food-delivery/module-driver-payout-engine]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันหลาย service เพราะ inter-service dependency สูง

## Gate พิเศษ

[[structure/synthetic-food-delivery/module-surge-pricer]] และ [[structure/synthetic-food-delivery/module-driver-payout-engine]] ต้องผ่าน integration test 100% ก่อน deploy เสมอ เพราะส่งผลต่อรายรับของคนขับโดยตรง service อื่นผ่อนปรนกว่า
