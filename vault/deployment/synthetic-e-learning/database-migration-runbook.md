---
layer: deployment
tags: [migration, runbook, database]
created: 2026-08-16
links:
  - "[[support-cases/synthetic-e-learning/case-6112]]"
---

# Database Migration Runbook

บทเรียนจาก [[support-cases/synthetic-e-learning/case-6112]] ทำให้ migration runbook นี้เพิ่ม validation step ที่เข้มงวดขึ้นมากกว่า practice ทั่วไป

## Pre-migration validation

count rows ทุก table ก่อน migration และบันทึกไว้เป็น baseline ทำ backup และ verify backup restore สำเร็จบน staging ก่อน run บน production เสมอ ห้ามรัน migration โดยไม่มี verified backup

## Post-migration validation

หลัง migration ต้อง count rows อีกครั้งและเทียบกับ baseline ก่อน commit และ sample check data integrity อย่างน้อย 100 rows แบบ random ถ้า row count ไม่ตรงต้อง rollback ทันทีไม่รอตรวจสาเหตุก่อน
