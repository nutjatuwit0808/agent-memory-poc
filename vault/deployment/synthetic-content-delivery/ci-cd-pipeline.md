---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-03-02
links:
  - "[[structure/synthetic-content-delivery/module-geo-router]]"
  - "[[structure/synthetic-content-delivery/module-certificate-manager]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (รวม geo-bypass test suite) → deploy staging → smoke test บน edge node จริง → canary deploy (5% traffic) → full deploy — ไม่ deploy พร้อมกันทุก PoP ในครั้งเดียว

## Gate พิเศษ

[[structure/synthetic-content-delivery/module-geo-router]] และ [[structure/synthetic-content-delivery/module-certificate-manager]] ต้องผ่าน security review ก่อน merge เสมอ เพราะกระทบ geo-restriction enforcement และ certificate lifecycle โดยตรง
