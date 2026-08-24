---
layer: deployment
tags: [incident, runbook]
created: 2026-08-04
links:
  - "[[business-logic/synthetic-travel-booking/overbooking-prevention-policy]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = เกิด overbooking หรือคิดเงินผิดหลายรายพร้อมกัน, Sev2 = ซัพพลายเออร์รายใหญ่ล่มหรือ cache ผิดปกติเป็นวงกว้าง, Sev3 = กระทบเล็กน้อยจำกัดวง

## กรณี overbooking

ทุกเหตุการณ์ overbooking ต้องยกระดับเป็น Sev1 เสมอไม่ว่าจะกระทบลูกค้ากี่รายก็ตาม และแจ้งทีม support ให้ดำเนินการชดเชยตาม [[business-logic/synthetic-travel-booking/overbooking-prevention-policy]] ภายใน 1 ชั่วโมง
