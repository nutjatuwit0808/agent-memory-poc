---
layer: structure
tags: [ranking, module, core]
created: 2026-08-01
links:
  - "[[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]]"
  - "[[structure/synthetic-social-feed/module-content-moderation-service]]"
---

# Module: feed-ranker

คำนวณคะแนนจัดอันดับโพสต์ต่อผู้ใช้แต่ละคน รวมสัญญาณจาก engagement, ความสัมพันธ์ follow, และ moderation status เข้าด้วยกัน แยกออกมาเป็น service อิสระตั้งแต่ปี 2024 เพราะโมเดลจัดอันดับซับซ้อนขึ้นเรื่อยๆ จนต้อง deploy แยกจาก service อื่นเพื่อ scale ตามภาระ compute ที่ต่างกันมาก

## ฟังก์ชันหลัก
- `computeFeedScore(userId: string, postId: string): Promise<number>` — คำนวณคะแนนของโพสต์เดียวสำหรับผู้ใช้คนเดียว
- `rankFeedPage(userId: string, cursor?: string): Promise<RankedPost[]>` — คืนหน้า feed ที่จัดอันดับแล้วสำหรับการเลื่อนดูครั้งถัดไป
- `invalidateScore(userId: string, postId: string): Promise<void>` — ล้างคะแนนที่ cache ไว้เมื่อมี engagement ใหม่เข้ามา

## State

computed → cached (สูงสุด 6 ชั่วโมง) → stale → recomputed — ดู [[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]] สำหรับเงื่อนไขการ refresh

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-social-feed/module-content-moderation-service]] โดยตรง — รับแค่ moderation status ผ่าน field ที่ sync เข้ามาใน `feed_scores` table เพราะการเรียก synchronous ทุกครั้งที่จัดอันดับจะทำให้ latency แย่เกินไป
