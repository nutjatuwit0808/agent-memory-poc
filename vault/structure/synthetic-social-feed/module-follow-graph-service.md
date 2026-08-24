---
layer: structure
tags: [follow, module]
created: 2026-05-24
links:
  - "[[business-logic/synthetic-social-feed/follow-request-privacy-policy]]"
  - "[[structure/synthetic-social-feed/module-notification-fanout]]"
---

# Module: follow-graph-service

เก็บความสัมพันธ์ follow/follower ทั้งหมดของแพลตฟอร์ม เป็น service เดียวที่รู้ว่าใคร follow ใคร service อื่นทั้งหมดที่ต้องการข้อมูลนี้ต้อง query ผ่านตัวนี้เท่านั้น ไม่มีการ cache follow graph ซ้ำใน service อื่น

## ฟังก์ชันหลัก
- `follow(followerId: string, followeeId: string): Promise<FollowResult>` — สร้างความสัมพันธ์ follow ใหม่ อาจต้องรออนุมัติถ้าบัญชี private
- `unfollow(followerId: string, followeeId: string): Promise<void>` — ยกเลิกการ follow
- `getFollowers(userId: string, cursor?: string): Promise<string[]>` — คืนรายการ follower แบบแบ่งหน้า

## State

requested → approved | rejected (สำหรับบัญชี private) หรือ approved ทันทีสำหรับบัญชี public — ดู [[business-logic/synthetic-social-feed/follow-request-privacy-policy]]

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-social-feed/module-notification-fanout]] query `getFollowers` ทุกครั้งที่ต้องกระจายแจ้งเตือน ไม่เก็บ snapshot ไว้เอง เพื่อให้ fanout ใช้ follow graph เวอร์ชันล่าสุดเสมอแม้ follower จะเพิ่ง unfollow ไปหมาดๆ
