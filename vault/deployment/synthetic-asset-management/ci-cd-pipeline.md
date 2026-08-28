---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-12-11
links:
  - "[[structure/synthetic-asset-management/module-license-pool-manager]]"
  - "[[structure/synthetic-asset-management/module-disposal-workflow]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (ครอบคลุม concurrent scenario) → deploy staging → smoke test → deploy production ทีละ module ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-asset-management/module-license-pool-manager]] และ [[structure/synthetic-asset-management/module-disposal-workflow]] ต้องผ่าน compliance test 100% ก่อน merge เสมอ เพราะ bug ใน module เหล่านี้กระทบ audit โดยตรง
