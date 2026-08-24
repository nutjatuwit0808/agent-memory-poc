---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-03-09
links:
  - "[[structure/synthetic-hr-onboarding/module-access-provisioning]]"
  - "[[structure/synthetic-hr-onboarding/module-document-collection]]"
  - "[[support-cases/synthetic-hr-onboarding/case-3704]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (mock vendor ทั้งหมด) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-hr-onboarding/module-access-provisioning]] และ [[structure/synthetic-hr-onboarding/module-document-collection]] ต้องผ่าน integration test ครอบคลุมทุก webhook event type ที่รู้จักก่อน merge เสมอ เพราะบทเรียนจาก [[support-cases/synthetic-hr-onboarding/case-3704]]
