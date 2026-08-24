---
layer: convention
tags: [logging, observability]
created: 2025-09-30
links:
  - "[[business-logic/synthetic-travel-booking/supplier-inventory-discrepancy-policy]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับการจองต้องมี `bookingId` หรือ `holdToken` เสมอ เพื่อไล่ log ข้าม service ได้ (availability-search → booking-engine → itinerary-builder)

## ระดับ log

discrepancy จาก `reconcileDiscrepancy` log เป็น `warn` เสมอ แม้จะดูเหมือนเรื่องเล็ก เพราะสะสมเป็นสัญญาณของปัญหาใหญ่ได้ตาม [[business-logic/synthetic-travel-booking/supplier-inventory-discrepancy-policy]]
