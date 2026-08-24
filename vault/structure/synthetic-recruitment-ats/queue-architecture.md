---
layer: structure
tags: [recruitment-ats, talentflow, queue, async]
created: 2026-04-22
links:
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
  - "[[structure/synthetic-recruitment-ats/module-offer-approval-workflow]]"
  - "[[structure/synthetic-recruitment-ats/module-background-check-integration]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `resume.parsed`, `stage.advanced`, `interview.scheduled`, `offer.approved`, `background_check.completed` — [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]] เป็นทั้งผู้ publish และ subscribe หลายตัวเพราะเป็นศูนย์กลางของสถานะผู้สมัคร

[[structure/synthetic-recruitment-ats/module-offer-approval-workflow]] subscribe `background_check.completed` จาก [[structure/synthetic-recruitment-ats/module-background-check-integration]] เพื่อปลดล็อกขั้นตอนส่ง offer letter ฉบับจริง โดยไม่ต้องรอให้ recruiter มา trigger เอง ออกแบบแบบนี้เพื่อลดความล่าช้าจากการรอคนกดปุ่มด้วยมือ
