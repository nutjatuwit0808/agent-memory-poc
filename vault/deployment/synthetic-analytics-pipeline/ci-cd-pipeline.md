---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-07-27
links:
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
  - "[[structure/synthetic-analytics-pipeline/module-warehouse-loader]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → transform rule regression test (สำหรับ service ที่แตะข้อมูล) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-analytics-pipeline/module-transform-engine]] และ [[structure/synthetic-analytics-pipeline/module-warehouse-loader]] ต้องผ่าน regression test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความถูกต้องของข้อมูลที่โหลดเข้า warehouse โดยตรง
