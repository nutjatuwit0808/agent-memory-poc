---
layer: deployment
tags: [migration, runbook]
created: 2026-06-20
links:
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
  - "[[structure/synthetic-recruitment-ats/module-resume-parser]]"
---

# Candidate Data Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อเปลี่ยนโครงสร้าง field ของ `candidates` หรือ `parsed_resumes` ต้อง migrate ข้อมูลที่มีอยู่เดิมทั้งหมดใน [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]] และ [[structure/synthetic-recruitment-ats/module-resume-parser]] พร้อมกัน

## ขั้นตอน

1) เพิ่ม field ใหม่แบบ nullable ก่อนเสมอ ไม่ลบ field เก่าทันที 2) backfill ข้อมูลเดิมเป็น batch job รันนอกเวลาทำการ 3) เปลี่ยน field ใหม่เป็น required หลัง backfill ครบและยืนยันความถูกต้องแล้วเท่านั้น
