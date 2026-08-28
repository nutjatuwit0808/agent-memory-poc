---
layer: structure
tags: [e-learning, learnpath, boundaries]
created: 2026-07-20
links:
  - "[[structure/synthetic-e-learning/module-progress-tracker]]"
  - "[[structure/synthetic-e-learning/module-assessment-engine]]"
  - "[[structure/synthetic-e-learning/module-certificate-issuer]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-e-learning/module-progress-tracker]] เป็นเจ้าของ learning progress ทั้งหมด ส่วน [[structure/synthetic-e-learning/module-assessment-engine]] เป็นเจ้าของ quiz/exam data และผลคะแนน ทั้งสองไม่รู้จักข้อมูลของกันและกันโดยตรง

[[structure/synthetic-e-learning/module-certificate-issuer]] เป็น service เดียวที่ query ข้าม [[structure/synthetic-e-learning/module-progress-tracker]] และ [[structure/synthetic-e-learning/module-assessment-engine]] พร้อมกันได้ เพราะการออก certificate ต้องยืนยันทั้ง completion ของเนื้อหาและผ่านเกณฑ์คะแนน การแยกออกจะทำให้เกิด race condition ที่ออก certificate โดยที่ยังไม่ผ่านเงื่อนไขครบ
