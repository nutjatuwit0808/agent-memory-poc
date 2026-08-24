---
layer: convention
tags: [review, quality]
created: 2026-01-26
links:
  - "[[support-cases/synthetic-smart-building/case-9198]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

การเปลี่ยน config ที่กระทบ deadband หรือ threshold ต้องมีคนที่สองยืนยันคืนค่าหลังทดสอบเสร็จเสมอ (ดูบทเรียนจาก [[support-cases/synthetic-smart-building/case-9198]]) และ logic ที่แตะ schedule ของ access-control-gateway ต้องมี test case ครอบคลุมประตูทางออกฉุกเฉินเสมอ
