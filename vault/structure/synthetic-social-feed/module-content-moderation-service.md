---
layer: structure
tags: [moderation, module, core]
created: 2025-11-09
links:
  - "[[structure/synthetic-social-feed/module-feed-ranker]]"
  - "[[business-logic/synthetic-social-feed/content-moderation-escalation-policy]]"
---

# Module: content-moderation-service

ตรวจสอบโพสต์ใหม่ทุกตัวหาเนื้อหาที่ผิดกฎ (hate speech, spam, ภาพผิดกฎหมาย) ใช้ทั้ง automated model และ human review queue สำหรับเคสที่โมเดลไม่มั่นใจ ทำงานแบบ async หลังโพสต์ขึ้น feed แล้ว (optimistic publish) ไม่ใช่ gate ก่อนโพสต์

## ฟังก์ชันหลัก
- `scanPost(postId: string, content: PostContent): Promise<ModerationResult>` — รันโมเดลตรวจสอบเนื้อหาอัตโนมัติ 1 ครั้ง
- `flagForReview(postId: string, confidence: number): Promise<void>` — ส่งเข้าคิว human review เมื่อโมเดลไม่มั่นใจพอ
- `removePost(postId: string, reason: string): Promise<void>` — ถอดโพสต์ออกจาก feed ทั้งหมดทันทีเมื่อยืนยันว่าผิดกฎ

## ความสัมพันธ์กับ module อื่น

publish event `post.removed` เมื่อถอดโพสต์ — [[structure/synthetic-social-feed/module-feed-ranker]] subscribe event นี้เพื่อล้างคะแนนที่ cache ไว้ ดู [[business-logic/synthetic-social-feed/content-moderation-escalation-policy]] สำหรับเกณฑ์ auto-remove vs ส่งคนตรวจ
