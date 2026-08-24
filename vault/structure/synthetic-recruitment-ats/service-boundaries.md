---
layer: structure
tags: [recruitment-ats, talentflow, boundaries]
created: 2026-06-28
links:
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
  - "[[structure/synthetic-recruitment-ats/module-resume-parser]]"
  - "[[structure/synthetic-recruitment-ats/module-job-requisition-manager]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]] เป็นเจ้าของสถานะผู้สมัครทุกคนในทุก pipeline ส่วน [[structure/synthetic-recruitment-ats/module-resume-parser]] เป็นเจ้าของแค่ผลลัพธ์การแกะข้อมูล (structured field) จาก resume ดิบเท่านั้น ไม่รู้จักสถานะ pipeline เลย

[[structure/synthetic-recruitment-ats/module-job-requisition-manager]] เป็น service เดียวที่ query ข้าม [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]] เพื่อคำนวณ headcount ที่ผูกกับ requisition แต่ละใบ — เหตุผลที่ยอมให้ query ข้าม service (ผิดหลักทั่วไป) คือการอนุมัติ headcount ต้องเห็นทั้งจำนวนตำแหน่งที่เปิดและจำนวนผู้สมัครที่กำลังจะปิด offer พร้อมกันในเวลาที่ตัดสินใจ ไม่งั้นจะเกิดการ overcommit headcount
