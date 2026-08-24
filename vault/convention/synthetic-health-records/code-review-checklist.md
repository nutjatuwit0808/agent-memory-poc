---
layer: convention
tags: [review, quality]
created: 2025-12-28
links:
  - "[[support-cases/synthetic-health-records/case-2407]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ข้อมูลผู้ป่วยหรือสิทธิ์การเข้าถึงต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-health-records/case-2407]]) และฟังก์ชันที่มีผลต่อความปลอดภัยผู้ป่วยต้องมีคนที่สองยืนยันก่อน merge
