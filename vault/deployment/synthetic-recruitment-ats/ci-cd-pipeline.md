---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-10-28
links:
  - "[[structure/synthetic-recruitment-ats/module-offer-approval-workflow]]"
  - "[[structure/synthetic-recruitment-ats/module-background-check-integration]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (สำหรับ service ที่แตะ external vendor) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-recruitment-ats/module-offer-approval-workflow]] และ [[structure/synthetic-recruitment-ats/module-background-check-integration]] ต้องผ่าน integration test กับ vendor sandbox 100% ก่อน merge เสมอ เพราะกระทบข้อมูลที่ไม่สามารถย้อนกลับได้ (offer ที่ส่งออกไปแล้ว)
