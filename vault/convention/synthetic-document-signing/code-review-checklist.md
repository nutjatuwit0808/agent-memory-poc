---
layer: convention
tags: [review, quality]
created: 2025-12-13
links:
  - "[[support-cases/synthetic-document-signing/case-1601]]"
  - "[[support-cases/synthetic-document-signing/case-6387]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่ตรวจสิทธิ์หรือลำดับการเซ็นต้อง validate ที่ backend เสมอ ห้ามเชื่อผลจาก client (บทเรียนจาก [[support-cases/synthetic-document-signing/case-1601]]) และฟังก์ชันที่รับ webhook จากภายนอกต้องมี idempotency check เสมอ (บทเรียนจาก [[support-cases/synthetic-document-signing/case-6387]])
