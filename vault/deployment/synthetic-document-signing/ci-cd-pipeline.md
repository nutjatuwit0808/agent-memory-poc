---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-01-04
links:
  - "[[structure/synthetic-document-signing/module-audit-trail-logger]]"
  - "[[structure/synthetic-document-signing/module-signature-capture]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (สำหรับ service ที่แตะ audit trail หรือลำดับการเซ็น) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-document-signing/module-audit-trail-logger]] และ [[structure/synthetic-document-signing/module-signature-capture]] ต้องผ่าน integration test ครอบคลุมทุก edge case ของลำดับการเซ็นก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความถูกต้องทางกฎหมายโดยตรง
