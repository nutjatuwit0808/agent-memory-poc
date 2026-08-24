---
layer: structure
tags: [chat-support-bot, helploop, queue, async]
created: 2026-05-13
links:
  - "[[structure/synthetic-chat-support-bot/module-handoff-router]]"
  - "[[structure/synthetic-chat-support-bot/module-rate-limiter]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `message.received`, `intent.classified`, `handoff.requested`, `handoff.accepted`, `conversation.closed` — [[structure/synthetic-chat-support-bot/module-handoff-router]] subscribe `handoff.requested` เพื่อจับคู่บทสนทนากับเจ้าหน้าที่ที่ว่างทันทีโดยไม่ต้อง poll คิวเอง

[[structure/synthetic-chat-support-bot/module-rate-limiter]] ไม่ subscribe event ใดๆ เลย — ทำงานแบบ synchronous check ก่อนข้อความจะเข้าสู่ pipeline เสมอ เพราะการ throttle ต้องเกิดก่อนที่ระบบจะเสียทรัพยากรประมวลผล intent ไปแล้ว ถ้าทำแบบ async จะ throttle ช้าเกินไป
