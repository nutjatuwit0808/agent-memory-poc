---
layer: convention
tags: [review, quality]
created: 2026-08-05
links:
  - "[[support-cases/synthetic-customer-segmentation/case-6464]]"
  - "[[support-cases/synthetic-customer-segmentation/case-3137]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่เขียน membership snapshot ต้องทำใน transaction เดียวและมี global lock guard เสมอ (บทเรียนจาก [[support-cases/synthetic-customer-segmentation/case-6464]]) และทุก export path ต้องผ่าน PII field scanner ก่อน send (บทเรียนจาก [[support-cases/synthetic-customer-segmentation/case-3137]])
