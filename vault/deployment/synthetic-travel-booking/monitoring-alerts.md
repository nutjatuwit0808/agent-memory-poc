---
layer: deployment
tags: [monitoring, observability]
created: 2026-04-17
links:
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
---

# Monitoring & Alerts

## Alert หลัก

discrepancy rate ของ [[structure/synthetic-travel-booking/module-supplier-sync]] เกิน 5 ครั้งใน 1 ชั่วโมงต่อซัพพลายเออร์เดียว, booking hold ที่ค้าง `held` เกิน TTL x 3 โดยยังไม่ถูกกวาด, refund ที่ค้างสถานะ `refund_stuck` เกิน 2 ชั่วโมง

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ
