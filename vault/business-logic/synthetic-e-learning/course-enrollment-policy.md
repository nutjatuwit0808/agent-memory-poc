---
layer: business-logic
tags: [enrollment, course, policy]
created: 2026-07-29
links:
  - "[[structure/synthetic-e-learning/module-course-catalog]]"
---

# นโยบายการ Enroll และ Unenroll คอร์ส

ผู้เรียนสามารถ enroll คอร์สได้ด้วยตัวเองหรือถูก assign โดย manager ผ่าน HR integration ระบบตรวจสอบ prerequisite อัตโนมัติผ่าน [[structure/synthetic-e-learning/module-course-catalog]] ก่อนยืนยัน enrollment และป้องกัน duplicate enrollment ของ learner-course pair เดิม

Enrollment ที่ไม่มีกิจกรรมใดๆ เกิน `ENROLLMENT_EXPIRY_DAYS` วันจะ expire อัตโนมัติ ผู้เรียนต้อง re-enroll ใหม่และเริ่มต้นใหม่ — ไม่มีการกู้คืน progress จาก enrollment ที่ expired แล้ว เพราะ content อาจมี version ใหม่ที่ต้องเรียนใหม่จากต้น
