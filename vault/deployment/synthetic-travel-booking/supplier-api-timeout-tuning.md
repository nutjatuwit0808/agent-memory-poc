---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-05-15
links:
  - "[[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]]"
  - "[[support-cases/synthetic-travel-booking/case-9534]]"
---

# Supplier API Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure/network เท่านั้น ไม่ใช่ business timeout ของ booking hold ซึ่งเป็นคนละเรื่องที่กำหนดไว้ใน [[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]]

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| API gateway → availability-search | 3.5s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| availability-search → supplier API | 3s | env `SEARCH_TIMEOUT_MS` |
| booking-engine → supplier API (confirm) | 8s | env `SUPPLIER_CONFIRM_TIMEOUT_MS` |
| supplier-sync → supplier API (poll) | 15s | env `SUPPLIER_SYNC_TIMEOUT_MS` |

## เหตุการณ์ที่เจอจริง

หลัง [[support-cases/synthetic-travel-booking/case-9534]] ทีมลด timeout ของ availability-search ลงจาก 5s เหลือ 3s เพื่อไม่ให้ query ค้างนานเกินไปตอนซัพพลายเออร์รายใหญ่ตอบช้า แลกกับการตัดซัพพลายเออร์ที่ช้าจริงๆ ออกจากผลลัพธ์เร็วขึ้น
