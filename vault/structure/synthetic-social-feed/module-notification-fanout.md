---
layer: structure
tags: [notification, module, core]
created: 2025-09-19
links:
  - "[[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]]"
  - "[[structure/synthetic-social-feed/module-follow-graph-service]]"
---

# Module: notification-fanout

กระจายการแจ้งเตือนให้ follower ทุกคนเมื่อผู้ที่ตามอยู่โพสต์ใหม่ ต้องรับมือกับ fanout ขนาดใหญ่มากเมื่อผู้ใช้ที่มี follower หลักล้านคนโพสต์ ซึ่งเป็นจุดที่ระบบเจอ load spike รุนแรงที่สุดในทั้งแพลตฟอร์ม

## ฟังก์ชันหลัก
- `fanoutNewPost(authorId: string, postId: string): Promise<void>` — เริ่มกระบวนการกระจายแจ้งเตือนให้ follower ทั้งหมด
- `enqueueNotificationBatch(followerIds: string[], postId: string): Promise<void>` — แบ่ง follower เป็น batch เข้าคิวส่งจริง
- `dedupNotification(userId: string, postId: string): Promise<boolean>` — เช็คว่าผู้ใช้คนนี้ได้รับแจ้งเตือนโพสต์นี้ไปแล้วหรือยัง

## State

queued → batched → dispatched — batch ละ FANOUT_BATCH_SIZE คน ดู [[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]]

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-social-feed/module-follow-graph-service]] เป็นคนบอกว่าใครคือ follower ของใคร fanout ไม่เก็บ follow graph ซ้ำเอง แค่ query ทุกครั้งที่ต้องกระจาย เพื่อให้ได้ข้อมูลล่าสุดเสมอ
