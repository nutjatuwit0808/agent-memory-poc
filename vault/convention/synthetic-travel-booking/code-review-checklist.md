---
layer: convention
tags: [review, quality]
created: 2026-05-21
links:
  - "[[support-cases/synthetic-travel-booking/case-3613]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ inventory count หรือ hold ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-travel-booking/case-3613]]) และการแปลงสกุลเงินหรือคำนวณเงินต้องมีคนที่สองตรวจสูตรก่อน merge
