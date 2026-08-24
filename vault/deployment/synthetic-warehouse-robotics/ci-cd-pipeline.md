---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-05-07
links:
  - "[[structure/synthetic-warehouse-robotics/module-picking-engine]]"
  - "[[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → simulation test (สำหรับ service ที่แตะการเคลื่อนไหวหุ่นยนต์) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งฟลีท

## Gate พิเศษ

[[structure/synthetic-warehouse-robotics/module-picking-engine]] และ [[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]] ต้องผ่าน simulation test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความปลอดภัยโดยตรง
