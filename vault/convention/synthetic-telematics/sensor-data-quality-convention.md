---
layer: convention
tags: [data, reliability]
created: 2025-11-24
links:
  - "[[support-cases/synthetic-telematics/case-8422]]"
  - "[[support-cases/synthetic-telematics/case-3238]]"
---

# Sensor Data Quality Convention

เอกสารนี้กำหนดวิธีจัดการข้อมูล sensor/GPS ดิบที่มีความไม่แน่นอนสูงกว่าข้อมูลทั่วไปมาก เพราะเป็นข้อมูลจากอุปกรณ์ภาคสนามที่ควบคุมคุณภาพไม่ได้เต็มที่

## การกรองข้อมูลผิดปกติ

ทุกฟังก์ชันที่รับข้อมูล GPS/sensor ดิบต้องตรวจสอบความเป็นไปได้ทางกายภาพก่อนนำไปคำนวณเสมอ (เช่น ความเร็วไม่เกินขีดจำกัดที่รถทำได้จริง) — บทเรียนจาก [[support-cases/synthetic-telematics/case-8422]] ที่ยังไม่ได้ implement การกรองนี้ครบถ้วน

## การจัดการข้อมูลขาดหายหรือซ้ำ

ต้องมี idempotency key จากอุปกรณ์เสมอเพื่อกรอง event ซ้ำจากการ retry ของอุปกรณ์เอง ไม่พึ่งพาการไม่มี duplicate จากฝั่งอุปกรณ์เพียงอย่างเดียว — บทเรียนจาก [[support-cases/synthetic-telematics/case-3238]]
