---
layer: convention
tags: [naming, style]
created: 2026-06-10
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `transcodeSegment`, `generateMasterPlaylist` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ของ asset

`assetId` รูปแบบ `AST-<10 หลัก>`, `renditionId` รูปแบบ `<assetId>-<rung>` เช่น `AST-0042871190-720p` ต้อง unique ทั่วทั้งระบบเสมอ
