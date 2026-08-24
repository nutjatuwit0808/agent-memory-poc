---
layer: convention
tags: [review, quality]
created: 2025-12-17
links:
  - "[[support-cases/synthetic-iot-fleet-tracker/case-5914]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้สถานะการผูกอุปกรณ์หรือทริปต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-iot-fleet-tracker/case-5914]]) และการเปลี่ยนค่า threshold ที่กระทบการแจ้งเตือนลูกค้าต้องมีคนที่สองยืนยันก่อน merge
