---
layer: convention
tags: [review, quality]
created: 2026-08-08
links:
  - "[[support-cases/synthetic-event-ticketing/case-1330]]"
  - "[[support-cases/synthetic-event-ticketing/case-5087]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้สถานะที่นั่งหรือการสแกนต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-event-ticketing/case-1330]] และ [[support-cases/synthetic-event-ticketing/case-5087]]) เพราะปัญหานี้เกิดซ้ำในหลาย module
