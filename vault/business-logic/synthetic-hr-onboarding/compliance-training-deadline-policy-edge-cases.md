---
layer: business-logic
tags: [compliance, reminder, edge-case]
created: 2026-02-01
links:
  - "[[support-cases/synthetic-hr-onboarding/case-9774]]"
  - "[[business-logic/synthetic-hr-onboarding/compliance-training-deadline-policy]]"
---

# ข้อยกเว้นเมื่อ Reminder ไม่ถูกส่งเพราะ LMS ไม่ยืนยันสถานะ

ถ้า LMS ภายนอกไม่ส่ง webhook ยืนยันว่าพนักงานลงทะเบียนคอร์สแล้วภายใน 48 ชั่วโมงหลัง `scheduleComplianceItem` ระบบจะไม่ถือว่า item นั้น "ไม่มีอยู่จริง" — ยังคงนับ deadline ต่อไปตามปกติโดยใช้วันที่สร้าง item เป็นฐาน ไม่ใช่รอ LMS ยืนยันก่อนเริ่มนับ

เหตุผลที่ไม่รอ LMS ยืนยันก่อนเริ่มนับเวลา เพราะเคยเกิดกรณีที่ LMS integration ล่มหลายวันแล้วไม่มีใครสังเกต ทำให้ deadline เลื่อนไปเรื่อยๆ โดยไม่มีใครรู้ตัว ดู [[support-cases/synthetic-hr-onboarding/case-9774]]

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-hr-onboarding/compliance-training-deadline-policy]] ("นโยบาย Deadline การอบรมภาคบังคับ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
