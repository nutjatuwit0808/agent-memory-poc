---
layer: business-logic
tags: [screening, edge-case]
created: 2026-07-11
links:
  - "[[support-cases/synthetic-recruitment-ats/case-1472]]"
  - "[[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]]"
---

# ข้อยกเว้นเมื่อ Resume Parser แกะข้อมูลผิดพลาดแต่ Confidence Score สูง

ถ้า recruiter รายงานว่าผลแกะข้อมูลผิดพลาดทั้งที่ confidence score สูงกว่า threshold (เช่น ปีประสบการณ์คำนวณผิด) ผู้สมัครคนนั้นจะถูก flag `parser_disputed` และดึงกลับเข้าคิวให้คนตรวจใหม่ทันที ไม่ว่าผลก่อนหน้าจะเป็น auto-reject หรือ auto-advance ไปแล้วก็ตาม

resume ที่ทำให้เกิด `parser_disputed` จะถูกเก็บเป็นตัวอย่างสำหรับปรับปรุงความแม่นยำของ parser รุ่นถัดไป แต่การแก้ไขจริงไม่ใช่ automatic — ต้องมีทีมตรวจสอบยืนยันก่อนเสมอ ดู [[support-cases/synthetic-recruitment-ats/case-1472]] สำหรับเคสจริงที่นำไปสู่ edge case นี้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]] ("นโยบายการ Auto-screen ผู้สมัครจากผลแกะ Resume") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
