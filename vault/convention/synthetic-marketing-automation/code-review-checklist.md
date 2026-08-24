---
layer: convention
tags: [review, quality]
created: 2026-05-30
links:
  - "[[support-cases/synthetic-marketing-automation/case-8213]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้สถานะ campaign หรือ send job ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-marketing-automation/case-8213]]) และการเพิ่ม cache ชั้นใดๆ ต้องระบุ invalidation strategy ชัดเจนก่อน merge เสมอ
