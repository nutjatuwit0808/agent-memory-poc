---
layer: structure
tags: [engagement, module, core]
created: 2025-11-14
links:
  - "[[structure/synthetic-social-feed/module-feed-ranker]]"
---

# Module: engagement-tracker

บันทึก event การ like/comment/share ทุกตัวแบบ append-only เป็นแหล่งข้อมูลดิบสำหรับทั้งการจัดอันดับ feed และการ retrain โมเดลในอนาคต ไม่มี service ไหนอื่นเขียนลง event log นี้โดยตรง

## ฟังก์ชันหลัก
- `recordLike(userId: string, postId: string): Promise<void>` — บันทึก like พร้อม dedup key กันนับซ้ำ
- `recordShare(userId: string, postId: string, targetContext: string): Promise<void>` — บันทึกการแชร์พร้อมบริบทปลายทาง
- `getEngagementCount(postId: string): Promise<EngagementCount>` — คืนจำนวน like/comment/share สะสมของโพสต์

## ความสัมพันธ์กับ module อื่น

ไม่รู้จัก concept "คะแนนจัดอันดับ" เลย — แค่บันทึก event ดิบแล้ว publish `engagement.recorded` ให้ [[structure/synthetic-social-feed/module-feed-ranker]] เป็นคนตัดสินใจว่าจะปรับคะแนนยังไง เพื่อรักษาหลัก separation of concerns
