---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-11-14
links:
  - "[[structure/synthetic-social-feed/module-content-moderation-service]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → canary test (สำหรับโมเดล ranking/moderation) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-social-feed/module-content-moderation-service]] ต้องผ่าน canary test 24 ชั่วโมงก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบเนื้อหาที่ผู้ใช้เห็นโดยตรงเท่ากัน
