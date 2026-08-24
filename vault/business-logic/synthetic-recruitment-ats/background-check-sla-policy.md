---
layer: business-logic
tags: [background-check, sla, policy]
created: 2026-02-13
links:
  - "[[structure/synthetic-recruitment-ats/module-background-check-integration]]"
  - "[[business-logic/synthetic-recruitment-ats/background-check-sla-policy-edge-cases]]"
---

# นโยบาย SLA การตรวจสอบประวัติ

การตรวจสอบประวัติที่ [[structure/synthetic-recruitment-ats/module-background-check-integration]] ส่งไปยัง vendor มี SLA มาตรฐาน `BGCHECK_SLA_HOURS` (ปกติ 72 ชั่วโมง) นับจาก `initiateCheck`

ถ้าเกิน SLA แล้วยังไม่ได้ผล ระบบจะแจ้ง recruiter ให้ทราบว่าอาจกระทบวันเริ่มงานที่วางแผนไว้ แต่จะไม่ยกเลิกหรือ retry คำขอเอง เพราะการ retry คำขอตรวจสอบประวัติซ้ำอาจทำให้เกิดค่าใช้จ่ายซ้ำซ้อนกับ vendor

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-recruitment-ats/background-check-sla-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
