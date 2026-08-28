---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-01-09
links:
  - "[[structure/synthetic-subscription-billing/module-proration-calculator]]"
  - "[[structure/synthetic-subscription-billing/module-dunning-engine]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → idempotency test (ครอบคลุมทุกฟังก์ชันที่มีผลกระทบทางการเงิน) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-subscription-billing/module-proration-calculator]] และ [[structure/synthetic-subscription-billing/module-dunning-engine]] ต้องผ่าน idempotency test 100% ก่อน merge เสมอ เพราะความผิดพลาดกระทบยอดเงินที่เรียกเก็บจากลูกค้าจริง
