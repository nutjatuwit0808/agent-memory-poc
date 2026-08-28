---
layer: deployment
tags: [e-learning, learnpath, environment, config, reference]
created: 2026-07-27
links:
  - "[[business-logic/synthetic-e-learning/course-enrollment-policy]]"
  - "[[business-logic/synthetic-e-learning/quiz-timer-policy]]"
  - "[[business-logic/synthetic-e-learning/retake-cooldown-policy]]"
  - "[[business-logic/synthetic-e-learning/mandatory-compliance-deadline-policy]]"
---

# Environment Variables Reference — LearnPath — ระบบ Learning Management System

## course-catalog-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `CATALOG_CACHE_TTL_MIN` | `60` | Course metadata ถูก cache — invalidate เมื่อ publish version ใหม่ |
| `DRAFT_EXPIRY_DAYS` | `30` | Draft ที่ไม่มีการแก้ไขเกินนี้จะ archive อัตโนมัติ |

## progress-tracker-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ENROLLMENT_EXPIRY_DAYS` | `365` | ดู [[business-logic/synthetic-e-learning/course-enrollment-policy]] |
| `PROGRESS_BATCH_FLUSH_INTERVAL_MS` | `5000` | Progress event จาก learner ถูก batch ก่อน write เพื่อลด DB load |
| `PROGRESS_DB_URL` | `postgres://progress-db.internal:5432/learnpath_progress` | secret ห้าม log |

## assessment-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `DEFAULT_QUIZ_TIMER_MIN` | `30` | ดู [[business-logic/synthetic-e-learning/quiz-timer-policy]] |
| `RETAKE_COOLDOWN_HOURS` | `24` | ดู [[business-logic/synthetic-e-learning/retake-cooldown-policy]] |
| `ANSWER_GRACE_PERIOD_SEC` | `30` | เวลาผ่อนผันหลัง timer หมดก่อน reject submission |

## compliance-deadline-monitor-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `REMINDER_ADVANCE_DAYS` | `30,14,7` | วันที่ส่ง reminder ล่วงหน้า (comma-separated) |
| `HR_SYNC_INTERVAL_HOURS` | `24` | ความถี่ sync สถานะ compliance ไปยัง HR system |
| `ESCALATION_DELAY_DAYS` | `3` | รอกี่วันหลัง deadline ก่อน escalate ไปยัง manager ดู [[business-logic/synthetic-e-learning/mandatory-compliance-deadline-policy]] |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
