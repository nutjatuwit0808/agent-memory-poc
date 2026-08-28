---
layer: convention
tags: [review, quality]
created: 2026-02-08
links:
  - "[[support-cases/synthetic-telematics/case-8422]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่ประมวลผลข้อมูล GPS/sensor ดิบต้องมี test กรณีข้อมูลผิดปกติทางกายภาพเสมอ (ดูบทเรียนจาก [[support-cases/synthetic-telematics/case-8422]]) และฟังก์ชันที่ปรับเบี้ยหรือคะแนนต้องมี test ครอบคลุม idempotency
