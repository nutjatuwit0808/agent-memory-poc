---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-08-11
links:
  - "[[structure/synthetic-event-ticketing/module-seat-inventory]]"
  - "[[structure/synthetic-event-ticketing/module-entry-scanner]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → concurrency test (ครอบคลุมทุกฟังก์ชันที่แก้สถานะที่นั่ง/บัตร) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-event-ticketing/module-seat-inventory]] และ [[structure/synthetic-event-ticketing/module-entry-scanner]] ต้องผ่าน concurrency test 100% ก่อน merge เสมอ เพราะความผิดพลาดในสองจุดนี้กระทบประสบการณ์หน้างานจริงที่แก้ไขยาก
