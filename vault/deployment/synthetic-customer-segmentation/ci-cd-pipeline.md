---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-08-04
links:
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (ครอบคลุม PII field scan path และ concurrent refresh scenario) → deploy staging → smoke test → deploy production ทีละ module ไม่ deploy พร้อมกัน

## Gate พิเศษ

[[structure/synthetic-customer-segmentation/module-channel-exporter]] ต้องผ่าน PII scanner test 100% ก่อน merge และ [[structure/synthetic-customer-segmentation/module-membership-refresher]] ต้องผ่าน concurrent lock test ก่อน merge — ทั้งสองเป็น compliance และ data integrity gate
