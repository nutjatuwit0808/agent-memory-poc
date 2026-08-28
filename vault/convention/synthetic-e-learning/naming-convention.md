---
layer: convention
tags: [naming, style]
created: 2026-07-13
links:
  - "[[convention/synthetic-e-learning/learner-id-convention]]"
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `enrollLearner`, `evaluateCertificateEligibility` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ของ domain

`learnerId` ใช้ employee ID จาก HR system โดยตรง, `courseId` รูปแบบ `COURSE-<kebab-slug>-<year>` เช่น `COURSE-data-privacy-2026` ดูรายละเอียดที่ [[convention/synthetic-e-learning/learner-id-convention]]
