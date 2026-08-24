---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-11-24
links:
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[structure/synthetic-marketing-automation/module-consent-manager]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (mock ESP ทั้งหมด) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-marketing-automation/module-send-scheduler]] และ [[structure/synthetic-marketing-automation/module-consent-manager]] ต้องผ่าน integration test ที่ครอบคลุม concurrent call และ consent check ครบทุกกรณีก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบ compliance โดยตรง
