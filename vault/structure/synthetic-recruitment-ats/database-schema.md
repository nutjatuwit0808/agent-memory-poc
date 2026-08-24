---
layer: structure
tags: [recruitment-ats, talentflow, database, schema]
created: 2026-01-29
links:
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]] ดูแล ได้แก่ `candidates` (ข้อมูลผู้สมัครหลัก), `pipeline_stages` (สถานะปัจจุบันของผู้สมัครแต่ละคนในแต่ละ requisition), และ `stage_transition_log` (ประวัติการย้ายขั้นทั้งหมด ไม่ลบทิ้งเพื่อ audit)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `candidates` | candidate-pipeline-tracker | หนึ่งแถวต่อผู้สมัครหนึ่งคน ไม่ผูกกับ requisition เดียว |
| `pipeline_stages` | candidate-pipeline-tracker | หนึ่งแถวต่อ (candidate, requisition) หนึ่งคู่ |
| `parsed_resumes` | resume-parser | ผลลัพธ์ structured field ล่าสุดต่อ resume หนึ่งไฟล์ |
| `interview_slots` | interview-scheduler | ตารางนัดสัมภาษณ์ทั้งหมด |
| `offers` | offer-approval-workflow | สถานะ offer และ approval chain |

ทุกตารางใช้ `candidateId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายคืนแทน
