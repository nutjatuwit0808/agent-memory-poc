---
layer: business-logic
tags: [quiz, timer, assessment, policy]
created: 2025-09-20
---

# นโยบาย Timer และการส่งคำตอบใน Quiz

Quiz แต่ละชุดมี timer ที่กำหนดใน assessment config ค่า default คือ `DEFAULT_QUIZ_TIMER_MIN` นาที timer เดินตั้งแต่เปิด session และไม่หยุดแม้ผู้เรียนจะปิด browser เพราะ server-side tracking

คำตอบที่ submit หลัง timer หมดจะถูก reject ยกเว้นอยู่ใน grace period `ANSWER_SUBMISSION_GRACE_PERIOD_SEC` วินาที ซึ่ง account สำหรับ network latency ปกติ ไม่ใช่ให้เวลาเพิ่มจริงๆ
