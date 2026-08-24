---
layer: structure
tags: [engagement, module, core, reference, identifiers]
created: 2026-03-03
links:
  - "[[structure/synthetic-social-feed/module-engagement-tracker]]"
  - "[[business-logic/synthetic-social-feed/engagement-dedup-policy]]"
---

# engagement-tracker — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด engagement-tracker สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-social-feed/module-engagement-tracker]])

## Public functions
- `recordLike(userId: string, postId: string): Promise<void>` — บันทึก like พร้อม dedup key กันนับซ้ำ
- `recordShare(userId: string, postId: string, targetContext: string): Promise<void>` — บันทึกการแชร์พร้อมบริบทปลายทาง
- `getEngagementCount(postId: string): Promise<EngagementCount>` — คืนจำนวน like/comment/share สะสมของโพสต์

## Internal constants
- `ENGAGEMENT_DEDUP_WINDOW_MS = 2000`
- `MAX_SHARE_DEPTH_TRACKED = 3`

## Type

```ts
interface EngagementCount {
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  lastUpdated: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการกันนับซ้ำที่ [[business-logic/synthetic-social-feed/engagement-dedup-policy]]
