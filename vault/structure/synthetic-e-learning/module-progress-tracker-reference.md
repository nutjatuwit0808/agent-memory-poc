---
layer: structure
tags: [progress, module, core, reference, identifiers]
created: 2026-07-17
links:
  - "[[structure/synthetic-e-learning/module-progress-tracker]]"
  - "[[business-logic/synthetic-e-learning/course-enrollment-policy]]"
  - "[[business-logic/synthetic-e-learning/learner-data-retention-policy]]"
---

# progress-tracker — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด progress-tracker สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-e-learning/module-progress-tracker]])

## Public functions
- `enrollLearner(learnerId: string, courseId: string): Promise<Enrollment>` — สร้าง enrollment record ตรวจสอบ prerequisite และ duplicate enrollment ก่อนยืนยัน
- `recordProgress(learnerId: string, courseId: string, contentId: string, pct: number): Promise<void>` — บันทึก progress ของบทเรียนแต่ละชิ้น รวม idempotency check ป้องกัน regression
- `getLearnerProgress(learnerId: string, courseId: string): Promise<LearnerProgress>` — ดึง overall progress รวม completion status และ time spent
- `markCourseComplete(learnerId: string, courseId: string): Promise<void>` — ยืนยัน completion หลังจากผ่านทุก section และ assessment แล้ว publish event `lesson.completed`

## Internal constants
- `PROGRESS_REGRESSION_GUARD = true`
- `ENROLLMENT_EXPIRY_DAYS = 365`
- `COMPLETION_THRESHOLD_PCT = 100`

## Type

```ts
interface LearnerProgress {
  learnerId: string;
  courseId: string;
  enrolledAt: string;
  overallPct: number;
  status: "enrolled" | "in_progress" | "awaiting_assessment" | "completed" | "expired";
  contentProgress: Record<string, number>;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง duplicate enrollment ที่ [[business-logic/synthetic-e-learning/course-enrollment-policy]] และ expiry ที่ [[business-logic/synthetic-e-learning/learner-data-retention-policy]]
