---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-04-24
links:
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[structure/synthetic-supply-chain/module-replenishment-trigger]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (ครอบคลุม concurrent + idempotency scenarios) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทุก service

## Gate พิเศษ

[[structure/synthetic-supply-chain/module-purchase-order-engine]] และ [[structure/synthetic-supply-chain/module-replenishment-trigger]] ต้องผ่าน integration test 100% ก่อน merge เสมอ เพราะ bug ในสอง service นี้กระทบ financial commitment โดยตรง
