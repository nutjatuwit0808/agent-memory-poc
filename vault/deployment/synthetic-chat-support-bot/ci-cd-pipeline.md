---
layer: deployment
tags: [ci-cd, deployment]
created: 2025-10-20
links:
  - "[[structure/synthetic-chat-support-bot/module-intent-classifier]]"
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → integration test (สำหรับ service ที่แตะ state หรือ routing) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-chat-support-bot/module-intent-classifier]] และ [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] ต้องผ่าน integration test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความถูกต้องของบทสนทนาโดยตรง
