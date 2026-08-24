---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-11-27
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → replay test (สำหรับ service ที่ประมวลผลตำแหน่ง) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] และ [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]] ต้องผ่าน replay test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความแม่นยำของตำแหน่งโดยตรง
