---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-05-12
links:
  - "[[structure/synthetic-fleet-maintenance/module-parts-inventory]]"
  - "[[structure/synthetic-fleet-maintenance/module-downtime-tracker]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (รวม concurrent deduction test สำหรับ parts-inventory) → deploy staging → smoke test → deploy production ทีละ service

## Gate พิเศษ

[[structure/synthetic-fleet-maintenance/module-parts-inventory]] และ [[structure/synthetic-fleet-maintenance/module-downtime-tracker]] ต้องผ่าน concurrent load test ก่อน merge เสมอ เพราะ bug ใน service เหล่านี้ส่งผลต่อ SLA ลูกค้าโดยตรง
