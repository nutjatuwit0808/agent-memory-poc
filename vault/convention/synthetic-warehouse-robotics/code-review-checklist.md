---
layer: convention
tags: [review, quality]
created: 2026-08-12
links:
  - "[[support-cases/synthetic-warehouse-robotics/case-8344]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ state ของหุ่นยนต์หรือ task ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-warehouse-robotics/case-8344]]) และการเปลี่ยน config ค่าที่กระทบ threshold ต้องมีคนที่สองยืนยันก่อน merge
