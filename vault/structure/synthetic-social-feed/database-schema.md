---
layer: structure
tags: [social-feed, pulsefeed, database, schema]
created: 2026-01-15
links:
  - "[[structure/synthetic-social-feed/module-engagement-tracker]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-social-feed/module-engagement-tracker]] ดูแล ได้แก่ `engagement_events` (event ดิบทุกตัวไม่ลบทิ้ง ใช้ retrain โมเดล), `engagement_dedup_keys` (กันนับซ้ำ), และ `daily_engagement_rollup`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `feed_scores` | feed-ranker | คะแนนต่อ (user, post) อายุไม่เกิน 6 ชั่วโมงก่อนต้องคำนวณใหม่ |
| `engagement_events` | engagement-tracker | append-only ไม่มีการ update/delete |
| `follow_edges` | follow-graph-service | adjacency list ทิศทางเดียว (follower → followee) |
| `moderation_flags` | content-moderation-service | สถานะ pending/removed/appealed ต่อโพสต์ |

ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวันแทน (เช่น เช็คว่าโพสต์ที่ถูก moderation ลบแล้วหลุดออกจาก feed_scores จริงไหม)
