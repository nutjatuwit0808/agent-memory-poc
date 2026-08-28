---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-12-07
links:
  - "[[structure/synthetic-telematics/module-accident-detector]]"
  - "[[structure/synthetic-telematics/module-premium-adjuster]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → sensor-data-quality test (ครอบคลุมกรณีข้อมูลผิดปกติทางกายภาพ) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-telematics/module-accident-detector]] และ [[structure/synthetic-telematics/module-premium-adjuster]] ต้องผ่าน test ครอบคลุม edge case 100% ก่อน merge เสมอ เพราะความผิดพลาดกระทบความปลอดภัยจริงหรือความเป็นธรรมทางการเงินของผู้ขับ
