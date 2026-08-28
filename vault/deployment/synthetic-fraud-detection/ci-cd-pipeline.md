---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-07-14
links:
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
  - "[[structure/synthetic-fraud-detection/module-rule-engine]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (รวม idempotency test) → deploy staging → shadow scoring test → deploy production ทีละ service

## Gate พิเศษ

[[structure/synthetic-fraud-detection/module-ml-scorer]] และ [[structure/synthetic-fraud-detection/module-rule-engine]] ต้องผ่าน false positive rate test บน validation dataset ก่อน deploy เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบ fraud decision โดยตรง
