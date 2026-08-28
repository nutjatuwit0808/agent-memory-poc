---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-05-12
links:
  - "[[structure/synthetic-quality-control/module-certification-generator]]"
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (พร้อม replication lag simulation สำหรับ certification-generator) → deploy staging → smoke test → deploy production ทีละ service

## Gate พิเศษ

[[structure/synthetic-quality-control/module-certification-generator]] และ [[structure/synthetic-quality-control/module-batch-inspector]] ต้องผ่าน integration test 100% ก่อน merge เสมอ เพราะ bug ใน service เหล่านี้มี compliance impact
