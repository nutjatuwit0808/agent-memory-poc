---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-08-09
links:
  - "[[structure/synthetic-legal-contracts/module-approval-router]]"
  - "[[structure/synthetic-legal-contracts/module-signature-orchestrator]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → approval-chain test (ครอบคลุมทุกโครงสร้างราคาที่รองรับ) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-legal-contracts/module-approval-router]] และ [[structure/synthetic-legal-contracts/module-signature-orchestrator]] ต้องผ่าน test ครอบคลุม role/ลำดับการเซ็น 100% ก่อน merge เสมอ เพราะความผิดพลาดในสองจุดนี้มีผลทางกฎหมายที่แก้ไขย้อนหลังไม่ได้
