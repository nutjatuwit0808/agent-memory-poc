---
layer: business-logic
tags: [background-check, edge-case]
created: 2026-02-12
links:
  - "[[business-logic/synthetic-recruitment-ats/background-check-sla-policy]]"
---

# ข้อยกเว้นเมื่อการตรวจสอบค้างสถานะ Pending นานผิดปกติ

ถ้าสถานะค้างเป็น `pending` เกิน 2 เท่าของ SLA มาตรฐาน (เช่น เกิน 144 ชั่วโมงจาก SLA 72 ชั่วโมง) ระบบจะยกระดับเป็น `stuck` และเปิดช่องให้ recruiting ops ติดต่อ vendor โดยตรงเพื่อสอบถามสถานะ นอกเหนือจากการรอ webhook ตามปกติ

วันเริ่มงานที่วางแผนไว้ล่วงหน้าจะไม่ถูกเลื่อนอัตโนมัติแม้ background check จะ stuck — ต้องเป็น recruiter หรือ hiring manager ตัดสินใจเองว่าจะเลื่อนวันเริ่มงานหรือรอ เพราะเป็นการตัดสินใจทางธุรกิจที่กระทบผู้สมัครโดยตรง ระบบไม่ควรตัดสินใจแทน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-recruitment-ats/background-check-sla-policy]] ("นโยบาย SLA การตรวจสอบประวัติ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
