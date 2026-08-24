---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-09-07
links:
  - "[[structure/synthetic-video-streaming/module-bitrate-ladder-selector]]"
  - "[[structure/synthetic-video-streaming/module-drm-license-server]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (สำหรับ service ที่แตะ transcode/ladder) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-video-streaming/module-bitrate-ladder-selector]] และ [[structure/synthetic-video-streaming/module-drm-license-server]] ต้องผ่าน integration test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบการเล่นวิดีโอโดยตรง
