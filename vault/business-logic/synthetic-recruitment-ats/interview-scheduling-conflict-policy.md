---
layer: business-logic
tags: [scheduling, policy]
created: 2026-02-06
links:
  - "[[structure/synthetic-recruitment-ats/module-interview-scheduler]]"
  - "[[business-logic/synthetic-recruitment-ats/interview-scheduling-conflict-policy-edge-cases]]"
---

# นโยบายการชนกันของตารางสัมภาษณ์

[[structure/synthetic-recruitment-ats/module-interview-scheduler]] ต้องตรวจสอบว่า interviewer ทุกคนว่างจริงก่อนยืนยัน `bookInterview` เสมอ โดยเช็คทั้งจาก slot ที่ TalentFlow รู้เองและจากปฏิทินภายนอกที่ sync ล่าสุด

ถ้า interviewer คนเดียวถูกจองสองนัดที่เวลาซ้อนกัน (จากช่องโหว่ race condition หรือ sync ล่าช้า) นัดที่จองทีหลังจะถูก mark เป็น `conflict` อัตโนมัติและแจ้ง recruiter ให้แก้ไขด้วยมือ ระบบจะไม่ยกเลิกนัดใดนัดหนึ่งเองโดยอัตโนมัติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-recruitment-ats/interview-scheduling-conflict-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
