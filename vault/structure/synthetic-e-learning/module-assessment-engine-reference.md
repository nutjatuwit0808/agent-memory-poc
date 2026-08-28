---
layer: structure
tags: [assessment, quiz, module, core, reference, identifiers]
created: 2026-03-24
links:
  - "[[structure/synthetic-e-learning/module-assessment-engine]]"
  - "[[business-logic/synthetic-e-learning/quiz-timer-policy]]"
  - "[[business-logic/synthetic-e-learning/retake-cooldown-policy]]"
---

# assessment-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด assessment-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-e-learning/module-assessment-engine]])

## Public functions
- `startAssessment(learnerId: string, assessmentId: string): Promise<AssessmentSession>` — สร้าง quiz session ใหม่ด้วย question set ที่ randomize สำหรับผู้เรียนนี้โดยเฉพาะ
- `submitAnswer(sessionId: string, questionId: string, answer: string): Promise<void>` — บันทึกคำตอบพร้อม timestamp — จะ reject ถ้า timer หมดแล้ว ดู [[business-logic/synthetic-e-learning/quiz-timer-policy]]
- `gradeAssessment(sessionId: string): Promise<AssessmentResult>` — ตรวจคะแนนและ publish event `assessment.graded` พร้อมผลลัพธ์
- `requestRetake(learnerId: string, assessmentId: string): Promise<RetakeEligibility>` — ตรวจสอบว่าผ่าน cooldown แล้วหรือยัง ดู [[business-logic/synthetic-e-learning/retake-cooldown-policy]]

## Internal constants
- `DEFAULT_QUIZ_TIMER_MIN = 30`
- `MAX_QUESTIONS_PER_SESSION = 50`
- `ANSWER_SUBMISSION_GRACE_PERIOD_SEC = 30`

## Type

```ts
interface AssessmentSession {
  sessionId: string;
  learnerId: string;
  assessmentId: string;
  questions: Question[];
  startedAt: string;
  timerMinutes: number;
  status: "pending" | "in_progress" | "submitted" | "graded";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง retake ที่ [[business-logic/synthetic-e-learning/retake-cooldown-policy]] และ timer ที่ [[business-logic/synthetic-e-learning/quiz-timer-policy]]
