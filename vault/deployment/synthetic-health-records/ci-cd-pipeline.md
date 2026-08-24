---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-11-14
links:
  - "[[structure/synthetic-health-records/module-patient-record-store]]"
  - "[[structure/synthetic-health-records/module-provider-access-control]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → access-control test (ครอบคลุมทุก endpoint ที่แตะข้อมูลผู้ป่วย) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-health-records/module-patient-record-store]] และ [[structure/synthetic-health-records/module-provider-access-control]] ต้องผ่าน access-control test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบสิทธิ์การเข้าถึงข้อมูลผู้ป่วยโดยตรง
