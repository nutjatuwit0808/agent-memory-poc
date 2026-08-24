---
layer: structure
tags: [recruitment-ats, talentflow, architecture, overview]
created: 2026-05-29
links:
  - "[[structure/synthetic-recruitment-ats/module-job-requisition-manager]]"
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
  - "[[structure/synthetic-recruitment-ats/module-resume-parser]]"
  - "[[structure/synthetic-recruitment-ats/module-interview-scheduler]]"
  - "[[structure/synthetic-recruitment-ats/module-offer-approval-workflow]]"
  - "[[structure/synthetic-recruitment-ats/module-background-check-integration]]"
---

# ภาพรวมสถาปัตยกรรม TalentFlow — ระบบติดตามผู้สมัครงาน (ATS)

TalentFlow คือระบบ Applicant Tracking System สำหรับทีมสรรหาบุคลากรขององค์กรขนาดกลางถึงใหญ่ ครอบคลุมตั้งแต่การเปิดตำแหน่งงาน (requisition), การติดตาม pipeline ผู้สมัครแต่ละคน, การแกะข้อมูลจาก resume, การนัดสัมภาษณ์, ไปจนถึง workflow อนุมัติ offer และการเชื่อมต่อระบบตรวจสอบประวัติภายนอก (background check) TalentFlow ไม่ได้เป็นเจ้าของข้อมูลพนักงานหลังรับเข้าทำงานแล้ว — เมื่อผู้สมัครเซ็นรับ offer และผ่าน background check ข้อมูลจะถูกส่งต่อให้ระบบ HRIS ภายนอกเป็นเจ้าของแทน

แต่ละตำแหน่งงาน (requisition) มี pipeline ของตัวเองที่ผู้สมัครเดินผ่านเป็นขั้นเป็นตอน ทีมวิศวกรรมเรียกช่วง 3 สัปดาห์แรกของไตรมาสว่า hiring surge window เพราะเป็นช่วงที่มี requisition ใหม่เปิดพร้อมกันมากที่สุดหลังงบประมาณไตรมาสใหม่อนุมัติ ทำให้ปริมาณ resume ที่ resume-parser ต้องประมวลผลพุ่งสูงกว่าช่วงปกติหลายเท่า

## Module หลัก

- **job-requisition-manager** — จัดการวงจรชีวิตของตำแหน่งงานตั้งแต่เปิดขอ approve จนถึงปิดตำแหน่ง แยกออกมาจาก candidate-pipeline-tracker ตั้งแต่กลางปี 2025 เพราะ logic การอนุมัติ headcount (multi-level approval, budget check) ซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-recruitment-ats/module-job-requisition-manager]]
- **candidate-pipeline-tracker** — เจ้าของสถานะผู้สมัครทุกคนในทุก pipeline ของทุกตำแหน่ง ทุก module อื่นที่ต้องรู้ว ดู [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]
- **resume-parser** — แกะข้อมูล resume ดิบ (PDF/DOCX) ให้เป็น structured field เช่น ประวัติการทำงาน, ท ดู [[structure/synthetic-recruitment-ats/module-resume-parser]]
- **interview-scheduler** — จัดตารางนัดสัมภาษณ์ระหว่างผู้สมัครกับ interviewer โดย sync กับปฏิทินภายนอก (Goog ดู [[structure/synthetic-recruitment-ats/module-interview-scheduler]]
- **offer-approval-workflow** — ควบคุม workflow การอนุมัติและส่ง offer letter ให้ผู้สมัคร ต้องผ่านลำดับผู้อนุมัต ดู [[structure/synthetic-recruitment-ats/module-offer-approval-workflow]]
- **background-check-integration** — เชื่อมต่อกับผู้ให้บริการตรวจสอบประวัติภายนอก (third-party vendor) ส่งคำขอตรวจสอบ ดู [[structure/synthetic-recruitment-ats/module-background-check-integration]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-recruitment-ats/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-recruitment-ats/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-recruitment-ats/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-recruitment-ats/database-schema]]
