---
layer: convention
tags: [review, quality]
created: 2026-08-02
links:
  - "[[support-cases/synthetic-loyalty-rewards/case-8108]]"
  - "[[support-cases/synthetic-loyalty-rewards/case-3220]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แตะ balance หรือ redemption ต้องมี test concurrent request เสมอ (บทเรียนจาก [[support-cases/synthetic-loyalty-rewards/case-8108]]) และ campaign configuration ต้องได้รับ second review ก่อน activate (บทเรียนจาก [[support-cases/synthetic-loyalty-rewards/case-3220]])
