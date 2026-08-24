---
layer: convention
tags: [testing, data]
created: 2026-04-19
links:
  - "[[support-cases/synthetic-analytics-pipeline/case-6567]]"
---

# Testing Convention

## Test ด้วยข้อมูลตัวอย่างที่มีปัญหาจริง

กฎการแปลงและกฎตรวจสอบคุณภาพต้องมี test case ที่ใช้ข้อมูลตัวอย่างซึ่งเคยทำให้เกิดปัญหาจริงมาก่อนเสมอ — บทเรียนจาก [[support-cases/synthetic-analytics-pipeline/case-6567]] คือ test ที่ใช้แต่ข้อมูล happy path ไม่เจอ edge case ที่เกิดขึ้นจริงจากต้นทาง

## Idempotency test

ฟังก์ชันที่แตะการโหลดข้อมูลเข้า warehouse ต้องมี test ยืนยันว่ารันซ้ำด้วย input เดิมแล้วไม่เกิดแถวซ้ำเสมอ
