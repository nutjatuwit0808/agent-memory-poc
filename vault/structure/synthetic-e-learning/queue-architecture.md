---
layer: structure
tags: [e-learning, learnpath, queue, async]
created: 2026-07-22
links:
  - "[[structure/synthetic-e-learning/module-compliance-deadline-monitor]]"
  - "[[structure/synthetic-e-learning/module-certificate-issuer]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `lesson.completed`, `assessment.submitted`, `assessment.graded`, `certificate.issued`, `compliance.deadline_approaching`, `compliance.overdue` — [[structure/synthetic-e-learning/module-compliance-deadline-monitor]] subscribe หลาย event เพื่อ track สถานะ compliance แบบ real-time

[[structure/synthetic-e-learning/module-certificate-issuer]] subscribe `assessment.graded` และ `lesson.completed` เพื่อตรวจสอบว่าผู้เรียน qualify สำหรับ certificate หรือยัง โดยไม่ต้องรอให้ผู้เรียน request เอง — ระบบจะ pre-evaluate และแจ้งให้ผู้เรียนรู้ทันทีที่ผ่านเงื่อนไขทั้งหมด
