---
layer: convention
tags: [review, quality]
created: 2025-12-19
links:
  - "[[support-cases/synthetic-analytics-pipeline/case-3421]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ retry logic หรือ load mode ต้องพิจารณากรณี partial success เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-analytics-pipeline/case-3421]]) และการเปลี่ยน default strategy ของ transform rule ต้องมีคนที่สองยืนยันก่อน merge
