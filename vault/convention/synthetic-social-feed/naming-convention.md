---
layer: convention
tags: [naming, style]
created: 2026-04-14
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `computeFeedScore`, `rankFeedPage` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier

`postId` รูปแบบ `post_<ULID>`, `userId` รูปแบบ `usr_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer เพื่อไม่ให้เดาจำนวนโพสต์ทั้งระบบได้
