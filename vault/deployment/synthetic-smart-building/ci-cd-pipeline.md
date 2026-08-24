---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-11-26
links:
  - "[[structure/synthetic-smart-building/module-access-control-gateway]]"
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → simulation test (สำหรับ service ที่แตะฮาร์ดแวร์จริง) → deploy staging → smoke test → deploy production ทีละอาคารนำร่องก่อนขยายไปอาคารอื่น

## Gate พิเศษ

[[structure/synthetic-smart-building/module-access-control-gateway]] และ [[structure/synthetic-smart-building/module-hvac-controller]] ต้องผ่าน simulation test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความปลอดภัยโดยตรง
