---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-12-19
links:
  - "[[structure/synthetic-e-learning/module-assessment-engine]]"
  - "[[structure/synthetic-e-learning/module-certificate-issuer]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (ครอบคลุม concurrent + security scenarios) → deploy staging → smoke test (รวม end-to-end enrollment → completion → certificate flow) → deploy production ทีละ service

## Gate พิเศษ

[[structure/synthetic-e-learning/module-assessment-engine]] ต้องผ่าน security test 100% ก่อน merge รวมถึง test ที่ตรวจ answer leak และ timer bypass [[structure/synthetic-e-learning/module-certificate-issuer]] ต้องผ่าน integration test กับทั้ง progress-tracker และ assessment-engine เพื่อตรวจ eligibility logic ถูกต้อง
