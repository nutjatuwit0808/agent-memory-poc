---
layer: structure
tags: [ranking, module, core, reference, identifiers]
created: 2025-09-04
links:
  - "[[structure/synthetic-social-feed/module-feed-ranker]]"
  - "[[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]]"
---

# feed-ranker — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด feed-ranker สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-social-feed/module-feed-ranker]])

## Public functions
- `computeFeedScore(userId: string, postId: string): Promise<number>` — คำนวณคะแนนของโพสต์เดียวสำหรับผู้ใช้คนเดียว
- `rankFeedPage(userId: string, cursor?: string): Promise<RankedPost[]>` — คืนหน้า feed ที่จัดอันดับแล้วสำหรับการเลื่อนดูครั้งถัดไป
- `invalidateScore(userId: string, postId: string): Promise<void>` — ล้างคะแนนที่ cache ไว้เมื่อมี engagement ใหม่เข้ามา

## Internal constants
- `FEED_SCORE_CACHE_TTL_HOURS = 6`
- `FEED_PAGE_SIZE = 20`
- `MAX_RANKING_CANDIDATES = 500`

## Type

```ts
interface RankedPost {
  postId: string;
  score: number;
  reason: "engagement" | "following" | "trending";
  computedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]]
