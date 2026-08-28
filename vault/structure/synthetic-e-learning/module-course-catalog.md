---
layer: structure
tags: [course, module, core]
created: 2026-01-25
links:
  - "[[structure/synthetic-e-learning/module-progress-tracker]]"
---

# Module: course-catalog

จัดการข้อมูล metadata ของคอร์สทั้งหมดในระบบ ครอบคลุม course version management, prerequisite mapping, learning objective, และ content structure ทุก service ที่ต้องรู้ว่าคอร์สมีเนื้อหาอะไรต้อง query ผ่าน service นี้เท่านั้น ไม่ให้ service อื่นเก็บ course metadata ซ้ำ

## ฟังก์ชันหลัก
- `getCourse(courseId: string, version?: string): Promise<Course>` — ดึง course metadata รวม structure และ prerequisite สำหรับ version ที่ระบุ หรือ latest ถ้าไม่ระบุ
- `publishCourse(courseId: string, content: CourseContent): Promise<string>` — publish version ใหม่ของคอร์ส คืน version string และ invalidate cache ของ version ก่อน
- `checkPrerequisites(learnerId: string, courseId: string): Promise<PrerequisiteResult>` — ตรวจสอบว่าผู้เรียนผ่าน prerequisite ของคอร์สนี้หรือยังก่อน enroll
- `deprecateCourse(courseId: string, replacedBy?: string): Promise<void>` — ปลด active status ของคอร์ส ป้องกัน enrollment ใหม่แต่ยังคงให้ผู้เรียนที่ enroll แล้วจบได้

## State

draft → review → published → deprecated — คอร์ส deprecated ยังเข้าถึงได้สำหรับผู้เรียนที่ enroll ก่อน deprecated แต่ห้าม enroll ใหม่

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-e-learning/module-progress-tracker]] เรียก `getCourse` เพื่อรู้ structure ของคอร์สก่อนบันทึก progress แต่ course-catalog ไม่รู้จักว่าใครกำลังเรียนอะไร — ข้อมูลนั้นเป็นของ [[structure/synthetic-e-learning/module-progress-tracker]] ทั้งหมด
