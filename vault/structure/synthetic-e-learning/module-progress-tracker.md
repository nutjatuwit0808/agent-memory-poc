---
layer: structure
tags: [progress, module, core]
created: 2026-06-01
links:
  - "[[business-logic/synthetic-e-learning/course-enrollment-policy]]"
  - "[[structure/synthetic-e-learning/module-course-catalog]]"
  - "[[structure/synthetic-e-learning/module-certificate-issuer]]"
---

# Module: progress-tracker

บันทึกและติดตาม learning progress ของผู้เรียนทุกคนแบบ real-time ครอบคลุมตั้งแต่การ enroll การเปิดบทเรียน การทำแบบทดสอบ จนถึงการสำเร็จคอร์ส เป็น single source of truth สำหรับสถานะการเรียนของผู้เรียนแต่ละคน ไม่มี service อื่นที่เก็บ progress ซ้ำ

## ฟังก์ชันหลัก
- `enrollLearner(learnerId: string, courseId: string): Promise<Enrollment>` — สร้าง enrollment record ตรวจสอบ prerequisite และ duplicate enrollment ก่อนยืนยัน
- `recordProgress(learnerId: string, courseId: string, contentId: string, pct: number): Promise<void>` — บันทึก progress ของบทเรียนแต่ละชิ้น รวม idempotency check ป้องกัน regression
- `getLearnerProgress(learnerId: string, courseId: string): Promise<LearnerProgress>` — ดึง overall progress รวม completion status และ time spent
- `markCourseComplete(learnerId: string, courseId: string): Promise<void>` — ยืนยัน completion หลังจากผ่านทุก section และ assessment แล้ว publish event `lesson.completed`

## State

enrolled → in_progress → awaiting_assessment → completed | expired — ดู [[business-logic/synthetic-e-learning/course-enrollment-policy]] สำหรับเงื่อนไข expiry

## ความสัมพันธ์กับ module อื่น

ไม่รู้จัก content ของบทเรียนโดยตรง รู้แค่ `contentId` และ percentage complete — content metadata อยู่ที่ [[structure/synthetic-e-learning/module-course-catalog]] ทั้งหมด [[structure/synthetic-e-learning/module-certificate-issuer]] subscribe event `lesson.completed` จาก service นี้เพื่อ pre-evaluate certificate eligibility
