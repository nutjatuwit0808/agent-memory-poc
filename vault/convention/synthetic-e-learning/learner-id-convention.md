---
layer: convention
tags: [learner, naming, convention]
created: 2025-10-12
---

# Learner ID & Course ID Convention

การใช้ identifier ที่สอดคล้องกับ HR system ทำให้ reconcile และ audit ข้ามระบบได้โดยตรง — เอกสารนี้กำหนด ID format ที่ต้องใช้ร่วมกันทุก service

## Learner ID

ใช้ employee ID จาก HR system โดยตรง รูปแบบ `EMP-<6 หลัก>` เช่น `EMP-001234` ไม่สร้าง internal UUID แยก เพราะจะทำให้ต้องมี mapping table และเพิ่มความซับซ้อนในการ sync กับ HR

## Course ID

`COURSE-<topic-slug>-<4 digit year>` เช่น `COURSE-data-privacy-2026`, `COURSE-safety-fire-2025` — ปีที่รวมใน ID คือปีที่ content version นั้นมีผลใช้งาน ไม่ใช่ปีที่สร้าง course

## Certificate ID

`CERT-<learnerId>-<courseId>-<timestamp>` เช่น `CERT-EMP001234-COURSE-data-privacy-2026-20260315` — format ให้ verify ได้ว่าเป็น certificate ของ learner ใด course ใด ออกเมื่อไหร่ โดยไม่ต้อง query database ก่อน
