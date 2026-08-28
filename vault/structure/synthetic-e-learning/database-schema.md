---
layer: structure
tags: [e-learning, learnpath, database, schema]
created: 2026-02-03
links:
  - "[[structure/synthetic-e-learning/module-progress-tracker]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-e-learning/module-progress-tracker]] ดูแล ได้แก่ `learner_enrollments` (สถานะการ enroll), `content_progress` (progress ต่อ lesson/section), และ `completion_events` (event log ทุกการสำเร็จ ไม่ลบทิ้งเพื่อ audit)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `courses` | course-catalog | metadata คอร์สและ version |
| `content_progress` | progress-tracker | อัปเดตทุกครั้งที่ผู้เรียน interact |
| `assessment_attempts` | assessment-engine | ทุก attempt รวม wrong answers |
| `certificates` | certificate-issuer | ประวัติ certificate ทั้งหมด |
| `compliance_records` | compliance-deadline-monitor | สถานะ compliance ต่อพนักงาน |

ทุกตารางที่เกี่ยวกับผู้เรียนใช้ `learner_id` ที่มาจาก HR system เป็น reference หลัก ไม่ใช่ internal UUID เพื่อให้ reconcile กับ HR data ได้ตรงๆ โดยไม่ต้องมี mapping table เพิ่ม
