---
layer: convention
tags: [review, quality]
created: 2026-04-10
links:
  - "[[support-cases/synthetic-energy-management/case-3658]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่ส่งคำสั่งควบคุมอุปกรณ์ต้องผ่าน `resolveConflict` เสมอ ไม่มีทางลัดส่งคำสั่งตรง (ดูบทเรียนจาก [[support-cases/synthetic-energy-management/case-3658]]) และ field เวลาที่ใช้ตั้งตารางล่วงหน้าต้องผูก timezone ชัดเจนเสมอ
