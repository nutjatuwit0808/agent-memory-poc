---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-09-02
links:
  - "[[structure/synthetic-travel-booking/module-booking-engine]]"
  - "[[structure/synthetic-travel-booking/module-cancellation-handler]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → concurrency test (สำหรับ service ที่แตะ inventory) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-travel-booking/module-booking-engine]] และ [[structure/synthetic-travel-booking/module-cancellation-handler]] ต้องผ่าน concurrency test 100% ก่อน merge เสมอ เพราะแตะเงินและสิทธิ์ในห้องโดยตรง service อื่นผ่อนปรนกว่า
