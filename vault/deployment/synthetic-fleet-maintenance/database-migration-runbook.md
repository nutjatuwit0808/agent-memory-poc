---
layer: deployment
tags: [migration, database, runbook]
created: 2026-04-04
---

# Database Migration Runbook

ขั้นตอน migration schema สำหรับ database ของแต่ละ service ใน WrenchHub

## หลักการ

migration ต้องทำแบบ backward-compatible เสมอ — เพิ่ม column ได้โดยไม่ต้อง deploy application พร้อมกัน แต่ drop column ต้องรอให้ application ไม่อ่าน column นั้นแล้วค่อย drop

## ขั้นตอน

1) test migration ใน staging กับ data snapshot จริง 2) backup production database ก่อน apply 3) apply migration แบบ rolling ทีละ service 4) verify ด้วย smoke test ว่า query หลักยังทำงานได้ 5) ถ้า fail rollback migration script ที่เตรียมไว้ล่วงหน้า
