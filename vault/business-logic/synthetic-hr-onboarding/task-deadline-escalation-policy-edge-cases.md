---
layer: business-logic
tags: [task, deadline, edge-case]
created: 2026-02-15
links:
  - "[[business-logic/synthetic-hr-onboarding/task-deadline-escalation-policy]]"
---

# ข้อยกเว้นเมื่อ Task ถูก Block โดย Task อื่นที่ยังไม่เสร็จ

ถ้า task A ต้องรอ task B เสร็จก่อนถึงจะเริ่มได้ (เช่น เซ็นสัญญาจ้างต้องเสร็จก่อนถึงจะขอ provision software ที่ต้อง background check ผ่านก่อน) deadline ของ task A จะนับจากตอนที่ task B เสร็จ ไม่ใช่นับจากตอนสร้าง case

ถ้า task B ที่ block อยู่เลยกำหนดของตัวเองไปแล้ว ระบบจะ escalate เฉพาะ task B เท่านั้น ไม่แจ้ง task A ซ้ำเพราะ A ยังไม่ถึงรอบนับเวลาของตัวเอง เพื่อไม่ให้หัวหน้างานเห็น alert ซ้ำซ้อนโดยไม่จำเป็น

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-hr-onboarding/task-deadline-escalation-policy]] ("นโยบาย Deadline และการ Escalate Task ที่เลยกำหนด") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
