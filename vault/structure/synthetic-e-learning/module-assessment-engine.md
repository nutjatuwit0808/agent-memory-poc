---
layer: structure
tags: [assessment, quiz, module, core]
created: 2026-08-01
links:
  - "[[business-logic/synthetic-e-learning/quiz-timer-policy]]"
  - "[[business-logic/synthetic-e-learning/retake-cooldown-policy]]"
  - "[[structure/synthetic-e-learning/module-certificate-issuer]]"
---

# Module: assessment-engine

จัดการแบบทดสอบและการตรวจคำตอบทั้งหมด ครอบคลุมการสร้าง quiz instance สำหรับผู้เรียนแต่ละคน การบันทึกคำตอบ การตรวจคะแนนอัตโนมัติ และการจัดการ retake ตาม cooldown policy ระบบออกแบบให้ question randomization ป้องกันการ copy คำตอบข้ามผู้เรียน โดยยังคง difficulty consistency

## ฟังก์ชันหลัก
- `startAssessment(learnerId: string, assessmentId: string): Promise<AssessmentSession>` — สร้าง quiz session ใหม่ด้วย question set ที่ randomize สำหรับผู้เรียนนี้โดยเฉพาะ
- `submitAnswer(sessionId: string, questionId: string, answer: string): Promise<void>` — บันทึกคำตอบพร้อม timestamp — จะ reject ถ้า timer หมดแล้ว ดู [[business-logic/synthetic-e-learning/quiz-timer-policy]]
- `gradeAssessment(sessionId: string): Promise<AssessmentResult>` — ตรวจคะแนนและ publish event `assessment.graded` พร้อมผลลัพธ์
- `requestRetake(learnerId: string, assessmentId: string): Promise<RetakeEligibility>` — ตรวจสอบว่าผ่าน cooldown แล้วหรือยัง ดู [[business-logic/synthetic-e-learning/retake-cooldown-policy]]

## State

pending → in_progress → submitted → graded — session ที่ timer หมดโดยไม่ submit จะถูก auto-grade ด้วยคำตอบที่ส่งมาแล้วเท่านั้น

## ความสัมพันธ์กับ module อื่น

ไม่รู้จักว่าผู้เรียนเรียนคอร์สไหนจบแล้วหรือยัง รู้แค่ว่า assessment นี้ผ่าน/ไม่ผ่าน — [[structure/synthetic-e-learning/module-certificate-issuer]] รับผิดชอบ logic การตัดสินว่าผ่านคะแนนทุก component แล้วจึง qualify certificate
