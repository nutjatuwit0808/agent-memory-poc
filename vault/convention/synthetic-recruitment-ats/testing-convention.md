---
layer: convention
tags: [testing, quality]
created: 2025-11-01
links:
  - "[[support-cases/synthetic-recruitment-ats/case-1472]]"
  - "[[support-cases/synthetic-recruitment-ats/case-1886]]"
---

# Testing Convention

## Test ครอบคลุม Locale

logic ที่แตะการแกะข้อมูลจาก resume ต้องมี test case ครอบคลุมฟอร์แมตวันที่และรูปแบบชื่อจากหลายวัฒนธรรมเสมอ — บทเรียนจาก [[support-cases/synthetic-recruitment-ats/case-1472]] และ [[support-cases/synthetic-recruitment-ats/case-1886]]

## Concurrent test

ฟังก์ชันที่แตะ pipeline stage transition หรือ interview booking ต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ
