---
layer: structure
tags: [pipeline, module, core]
created: 2026-04-01
links:
  - "[[structure/synthetic-recruitment-ats/module-resume-parser]]"
  - "[[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]]"
  - "[[business-logic/synthetic-recruitment-ats/pipeline-auto-advance-policy]]"
---

# Module: candidate-pipeline-tracker

เจ้าของสถานะผู้สมัครทุกคนในทุก pipeline ของทุกตำแหน่ง ทุก module อื่นที่ต้องรู้ว่าผู้สมัครอยู่ขั้นไหนต้อง query ผ่านตัวนี้เท่านั้น ไม่มี module ไหนเก็บ state ผู้สมัครซ้ำเอง เป็นศูนย์กลางที่ event หลักเกือบทั้งหมดของระบบไหลผ่าน

## ฟังก์ชันหลัก
- `advanceStage(candidateId: string, requisitionId: string, toStage: PipelineStage): Promise<void>` — ย้ายผู้สมัครไปขั้นถัดไปใน pipeline
- `rejectCandidate(candidateId: string, requisitionId: string, reason: string): Promise<void>` — ปฏิเสธผู้สมัครออกจาก pipeline พร้อมเหตุผล
- `getCurrentStage(candidateId: string, requisitionId: string): Promise<PipelineStage>` — คืนขั้นปัจจุบันของผู้สมัครใน requisition ที่ระบุ
- `mergeDuplicateCandidate(primaryId: string, duplicateId: string): Promise<void>` — รวม record ผู้สมัครที่ระบบตรวจพบว่าซ้ำกันเข้าด้วยกัน

## State

applied → screening → interviewing → offer → hired | rejected | withdrawn (ผู้สมัครถอนตัวเอง)

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-recruitment-ats/module-resume-parser]] โดยตรงในเชิง command — subscribe event `resume.parsed` แล้วตัดสินใจเองว่าจะ advance stage อัตโนมัติหรือรอ recruiter ตรวจก่อน ดู [[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]] และ [[business-logic/synthetic-recruitment-ats/pipeline-auto-advance-policy]]
