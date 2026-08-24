---
layer: structure
tags: [notification, module, core, reference, identifiers]
created: 2026-05-07
links:
  - "[[structure/synthetic-social-feed/module-notification-fanout]]"
  - "[[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]]"
---

# notification-fanout — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด notification-fanout สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-social-feed/module-notification-fanout]])

## Public functions
- `fanoutNewPost(authorId: string, postId: string): Promise<void>` — เริ่มกระบวนการกระจายแจ้งเตือนให้ follower ทั้งหมด
- `enqueueNotificationBatch(followerIds: string[], postId: string): Promise<void>` — แบ่ง follower เป็น batch เข้าคิวส่งจริง
- `dedupNotification(userId: string, postId: string): Promise<boolean>` — เช็คว่าผู้ใช้คนนี้ได้รับแจ้งเตือนโพสต์นี้ไปแล้วหรือยัง

## Internal constants
- `FANOUT_BATCH_SIZE = 1000`
- `CELEBRITY_FOLLOWER_THRESHOLD = 100000`

## Type

```ts
interface FanoutJob {
  jobId: string;
  authorId: string;
  postId: string;
  totalFollowers: number;
  dispatchedCount: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง rate limit ที่ [[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]]
