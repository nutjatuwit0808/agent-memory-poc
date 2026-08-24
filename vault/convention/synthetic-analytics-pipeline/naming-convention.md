---
layer: convention
tags: [naming, style]
created: 2026-01-04
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `runExtract`, `applyTransform` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ทางกายภาพ

`datasetId` รูปแบบ `<domain>.<name>` เช่น `sales.daily_orders`, `runId` เป็น UUID เสมอ ห้ามใช้เลขรันไปเรื่อยๆ เพราะต้อง unique ข้าม service ได้โดยไม่ต้องมี central counter
