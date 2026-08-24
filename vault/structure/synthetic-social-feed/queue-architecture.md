---
layer: structure
tags: [social-feed, pulsefeed, queue, async]
created: 2025-12-11
links:
  - "[[structure/synthetic-social-feed/module-notification-fanout]]"
  - "[[structure/synthetic-social-feed/module-feed-ranker]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `post.created`, `post.removed`, `engagement.recorded`, `follow.created`, `follow.removed` — [[structure/synthetic-social-feed/module-notification-fanout]] subscribe `post.created` เพื่อดันแจ้งเตือนให้ follower ทุกคน

[[structure/synthetic-social-feed/module-feed-ranker]] subscribe `engagement.recorded` เพื่ออัปเดตคะแนนแบบ incremental แทนที่จะรอคำนวณใหม่ทั้งหมดทุกครั้ง — ออกแบบแบบนี้เพื่อให้ feed ตอบสนองต่อ engagement ใหม่ได้ไวโดยไม่ต้อง recompute เต็มรูปแบบทุกครั้ง
