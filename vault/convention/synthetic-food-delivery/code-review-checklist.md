---
layer: convention
tags: [review, quality]
created: 2025-10-04
links:
  - "[[support-cases/synthetic-food-delivery/case-4679]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ state ของ order หรือ driver ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-food-delivery/case-4679]]) และการเปลี่ยน config ค่าที่กระทบ threshold หรือ cap ต้องมีคนที่สองยืนยันก่อน merge
