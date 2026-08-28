---
layer: convention
tags: [review, quality]
created: 2025-10-05
links:
  - "[[support-cases/synthetic-legal-contracts/case-5109]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ approval chain หรือลำดับการเซ็นต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-legal-contracts/case-5109]]) และฟังก์ชันที่กระทบเนื้อหาสัญญาที่มีเงื่อนไขรักษาความลับต้องมีคนที่สองยืนยันก่อน merge
