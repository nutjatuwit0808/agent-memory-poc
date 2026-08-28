---
layer: structure
tags: [telematics, drivelog, database, schema]
created: 2025-11-17
links:
  - "[[structure/synthetic-telematics/module-trip-collector]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-telematics/module-trip-collector]] ดูแล ได้แก่ `gps_traces` (time-series), `trips` (สรุปแต่ละเที่ยว), และ `harsh_events`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `gps_traces` | trip-collector | time-series เก็บทุกจุดพิกัดดิบ ไม่ aggregate ล่วงหน้า |
| `driving_scores` | driving-scorer | ไม่มี FK ตรงไป trips ใช้ tripId แบบ soft reference |
| `premium_adjustments` | premium-adjuster | เก็บประวัติการปรับเบี้ยทุกครั้ง ไม่เขียนทับของเดิม |
| `accident_alerts` | accident-detector | append-only เก็บทุกครั้งที่ตรวจพบสัญญาณอุบัติเหตุไม่ว่ายืนยันจริงหรือไม่ |

ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก driving_score มี tripId ที่มีอยู่จริง)
