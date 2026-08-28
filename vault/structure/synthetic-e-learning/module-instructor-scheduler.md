---
layer: structure
tags: [instructor, scheduling, module]
created: 2026-04-06
links:
  - "[[business-logic/synthetic-e-learning/instructor-conflict-resolution-policy]]"
  - "[[structure/synthetic-e-learning/module-progress-tracker]]"
---

# Module: instructor-scheduler

จัดการตารางสอนของ instructor ทั้งหมด ครอบคลุมการนัดหมาย live session การ assign instructor ให้กับ cohort ผู้เรียน และการตรวจสอบ conflict ของตาราง แยกออกมาเป็น service อิสระเพราะ scheduling logic มีความซับซ้อนของ timezone หลายโซนและข้อจำกัดของ instructor แต่ละคนที่ไม่เกี่ยวกับ learning content

## ฟังก์ชันหลัก
- `scheduleSession(instructorId: string, courseId: string, slot: TimeSlot): Promise<Session>` — นัดหมาย live session ตรวจสอบ conflict ของ instructor และ venue ก่อนยืนยัน
- `checkInstructorAvailability(instructorId: string, dateRange: DateRange): Promise<AvailabilitySlot[]>` — คืนช่วงเวลาที่ instructor ว่างสำหรับการ schedule session ใหม่
- `resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void>` — แก้ไข conflict ที่พบ ดู [[business-logic/synthetic-e-learning/instructor-conflict-resolution-policy]]
- `notifySessionChange(sessionId: string, changeType: string): Promise<void>` — แจ้ง instructor และผู้เรียนที่ enroll เมื่อ session เปลี่ยนแปลง

## ความสัมพันธ์กับ module อื่น

ไม่รู้จักสถานะการเรียนของผู้เรียนเลย รู้แค่ว่ามีผู้เรียนกี่คนที่ enroll ใน cohort — ข้อมูล progress เป็นของ [[structure/synthetic-e-learning/module-progress-tracker]] ทั้งหมด ดู [[business-logic/synthetic-e-learning/instructor-conflict-resolution-policy]] สำหรับกติกาการจัดการ conflict
