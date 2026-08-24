---
layer: convention
tags: [naming, data]
created: 2026-08-09
links:
  - "[[structure/synthetic-recruitment-ats/module-resume-parser]]"
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
  - "[[structure/synthetic-recruitment-ats/module-offer-approval-workflow]]"
  - "[[support-cases/synthetic-recruitment-ats/case-1886]]"
---

# Candidate Record Field Naming Convention

เอกสารนี้กำหนดชื่อ field มาตรฐานสำหรับข้อมูลผู้สมัครที่ทุก module ต้องใช้ตรงกัน เพื่อไม่ให้ [[structure/synthetic-recruitment-ats/module-resume-parser]], [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]], และ [[structure/synthetic-recruitment-ats/module-offer-approval-workflow]] ตั้งชื่อ field เดียวกันต่างกัน

## field ชื่อบุคคล

ใช้ `fullName` เป็น field เดียวสำหรับแสดงผล ไม่แยก `firstName`/`lastName` เป็น field บังคับ เพราะรูปแบบชื่อหลายวัฒนธรรมไม่แยกส่วนแบบตะวันตกเสมอไป (ดูบทเรียนจาก [[support-cases/synthetic-recruitment-ats/case-1886]]) ถ้าต้องแยกให้เก็บเป็น field เสริม `nameParts` ที่ไม่บังคับ

## field วันที่

ทุก field วันที่เก็บเป็น ISO 8601 เสมอหลังผ่านการ parse แล้ว ไม่เก็บฟอร์แมตดิบจาก resume ต้นฉบับไว้ในระบบหลัก
