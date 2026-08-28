---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-09-23
links:
  - "[[structure/synthetic-loyalty-rewards/module-redemption-engine]]"
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (รวม concurrent redemption test และ idempotency test) → deploy staging → smoke test → deploy production ทีละ service

## Gate พิเศษ

[[structure/synthetic-loyalty-rewards/module-redemption-engine]] และ [[structure/synthetic-loyalty-rewards/module-points-ledger]] ต้องผ่าน idempotency test และ concurrent request test ก่อน merge เสมอ
