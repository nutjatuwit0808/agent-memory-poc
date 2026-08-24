---
layer: convention
tags: [naming, style]
created: 2026-08-12
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `classifyIntent`, `retrieveArticles` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ของบทสนทนา

`conversationId` รูปแบบ `CONV-<10 หลัก>`, `articleId` รูปแบบ `<orgId>-KB-<5 หลัก>` ต้อง unique ทั่วทั้งระบบเสมอ
