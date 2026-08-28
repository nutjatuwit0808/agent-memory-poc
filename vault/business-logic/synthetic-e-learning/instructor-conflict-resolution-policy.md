---
layer: business-logic
tags: [instructor, scheduling, conflict, policy]
created: 2025-09-03
links:
  - "[[structure/synthetic-e-learning/module-instructor-scheduler]]"
  - "[[business-logic/synthetic-e-learning/instructor-conflict-resolution-policy-edge-cases]]"
---

# นโยบายการแก้ไข Conflict ตารางสอนของ Instructor

เมื่อ [[structure/synthetic-e-learning/module-instructor-scheduler]] ตรวจพบ conflict ในตารางสอน เช่น instructor ถูก assign สอง session ในเวลาเดียวกัน หรือ venue ถูก double-book ระบบจะ flag conflict และแจ้ง scheduling admin ทันทีโดยไม่ยืนยัน session ใดโดยอัตโนมัติ

Conflict ที่ยังไม่ได้แก้ไขจะไม่แจ้งผู้เรียนที่ enroll ว่า session นั้นมีปัญหา เพื่อป้องกันความสับสน scheduling admin มี 24 ชั่วโมงในการ resolve conflict ก่อนที่ระบบจะ escalate และแจ้งผู้เรียนว่า session อาจมีการเปลี่ยนแปลง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-e-learning/instructor-conflict-resolution-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
