---
layer: convention
tags: [naming, style]
created: 2026-04-18
links:
  - "[[support-cases/synthetic-document-signing/case-6132]]"
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `recordSignature`, `validateSignerTurn` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Timestamp

timestamp ทุกตัวในระบบต้องเก็บเป็น UTC เท่านั้น ห้ามเก็บ local timezone แล้วแปลงทีหลัง — บทเรียนตรงจาก [[support-cases/synthetic-document-signing/case-6132]]
