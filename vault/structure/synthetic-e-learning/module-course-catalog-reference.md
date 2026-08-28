---
layer: structure
tags: [course, module, core, reference, identifiers]
created: 2025-11-25
links:
  - "[[structure/synthetic-e-learning/module-course-catalog]]"
  - "[[business-logic/synthetic-e-learning/passing-score-threshold-policy]]"
  - "[[business-logic/synthetic-e-learning/content-version-policy]]"
---

# course-catalog — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด course-catalog สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-e-learning/module-course-catalog]])

## Public functions
- `getCourse(courseId: string, version?: string): Promise<Course>` — ดึง course metadata รวม structure และ prerequisite สำหรับ version ที่ระบุ หรือ latest ถ้าไม่ระบุ
- `publishCourse(courseId: string, content: CourseContent): Promise<string>` — publish version ใหม่ของคอร์ส คืน version string และ invalidate cache ของ version ก่อน
- `checkPrerequisites(learnerId: string, courseId: string): Promise<PrerequisiteResult>` — ตรวจสอบว่าผู้เรียนผ่าน prerequisite ของคอร์สนี้หรือยังก่อน enroll
- `deprecateCourse(courseId: string, replacedBy?: string): Promise<void>` — ปลด active status ของคอร์ส ป้องกัน enrollment ใหม่แต่ยังคงให้ผู้เรียนที่ enroll แล้วจบได้

## Internal constants
- `MAX_COURSE_VERSIONS_RETAINED = 10`
- `DRAFT_EXPIRY_DAYS = 30`
- `PREREQUISITE_CHECK_CACHE_TTL_MIN = 15`

## Type

```ts
interface Course {
  courseId: string;
  version: string;
  title: string;
  status: "draft" | "review" | "published" | "deprecated";
  prerequisites: string[];
  estimatedDurationMin: number;
  passingScorePct: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่องเกณฑ์ผ่านที่ [[business-logic/synthetic-e-learning/passing-score-threshold-policy]] และ course version ที่ [[business-logic/synthetic-e-learning/content-version-policy]]
