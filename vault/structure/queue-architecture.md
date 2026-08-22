---
layer: structure
tags: [queue, async, architecture]
created: 2026-01-25
links:
  - "[[structure/overview-architecture]]"
  - "[[structure/module-notification]]"
---

# Queue Architecture

ใช้ RabbitMQ เป็น message broker กลาง แต่ละ service มี exchange ของตัวเอง

## Pattern

Topic exchange + routing key รูปแบบ `<domain>.<event>` เช่น `order.created`, `refund.completed`, `payment.failed`

Consumer แต่ละตัว bind queue ของตัวเองเข้ากับ routing key ที่สนใจ — ไม่มี consumer ไหน subscribe ทุก event เพราะ throughput จะรวมศูนย์ที่ consumer เดียวมากเกินไป

## Retry และ Dead Letter

ทุก queue ตั้ง DLX (dead letter exchange) — message ที่ consumer process ไม่สำเร็จ 3 ครั้งจะถูกย้ายไป `<queue>.dlq` แล้วแจ้ง alert ให้คนมาดู ไม่ retry ไม่จำกัดจนวน loop เงียบๆ

## ทำไมไม่ใช้ synchronous call ทุกที่

ถ้า notification-service ล่ม ไม่ควรทำให้ order-service สร้าง order ไม่ได้ — async ทำให้ service ที่ไม่ critical ต่อ transaction หลัก fail แบบไม่กระทบ user ตรงหน้า ดูตัวอย่างการใช้งานที่ [[structure/module-notification]]
