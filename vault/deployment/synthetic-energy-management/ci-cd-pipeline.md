---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-04-11
links:
  - "[[structure/synthetic-energy-management/module-demand-response-controller]]"
  - "[[structure/synthetic-energy-management/module-equipment-scheduler]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → conflict-resolution test (ครอบคลุมคำสั่งขัดแย้งจากหลายแหล่ง) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-energy-management/module-demand-response-controller]] และ [[structure/synthetic-energy-management/module-equipment-scheduler]] ต้องผ่าน test ครอบคลุม safety-critical equipment 100% ก่อน merge เสมอ เพราะความผิดพลาดกระทบความปลอดภัยจริงในอาคาร
