---
layer: convention
tags: [review, quality]
created: 2026-05-16
links:
  - "[[support-cases/synthetic-inventory-forecasting/case-1481]]"
  - "[[support-cases/synthetic-inventory-forecasting/case-5588]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

งานที่แตะ backfill หรือ bulk update ต้อง exclude แถวที่มี `source = "analyst_override"` เสมอ (บทเรียนจาก [[support-cases/synthetic-inventory-forecasting/case-1481]]) และการปรับ threshold ต้องระบุ scope ชัดเจนว่าถาวรหรือชั่วคราว (บทเรียนจาก [[support-cases/synthetic-inventory-forecasting/case-5588]])
