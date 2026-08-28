---
layer: convention
tags: [review, quality]
created: 2025-12-30
links:
  - "[[support-cases/synthetic-asset-management/case-4888]]"
  - "[[support-cases/synthetic-asset-management/case-6657]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่เปลี่ยนสถานะสินทรัพย์หรือ allocation ต้องทำแบบ atomic เสมอ (บทเรียนจาก [[support-cases/synthetic-asset-management/case-4888]]) และ config ที่กระทบ threshold ต้องมีคนที่สองยืนยันก่อน merge (บทเรียนจาก [[support-cases/synthetic-asset-management/case-6657]])
