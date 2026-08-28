---
layer: convention
tags: [testing, quality]
created: 2026-02-24
links:
  - "[[support-cases/synthetic-telematics/case-8422]]"
  - "[[support-cases/synthetic-telematics/case-8677]]"
---

# Testing Convention

## Physical plausibility test

ฟังก์ชันที่ประมวลผลข้อมูล GPS/sensor ต้องมี test ที่ป้อนค่าที่เป็นไปไม่ได้ทางกายภาพเสมอ (เช่น ความเร็วเกินขีดจำกัดรถ) — บทเรียนจาก [[support-cases/synthetic-telematics/case-8422]]

## Idempotency test

ฟังก์ชันที่แก้ไขคะแนนหรือเบี้ยประกันต้องมี test ยืนยันว่าเรียกซ้ำแล้วผลลัพธ์ไม่เปลี่ยน — บทเรียนจาก [[support-cases/synthetic-telematics/case-8677]]
