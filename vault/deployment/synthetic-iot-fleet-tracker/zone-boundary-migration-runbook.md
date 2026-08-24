---
layer: deployment
tags: [migration, runbook]
created: 2026-01-25
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
---

# Zone Boundary Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อลูกค้าขอปรับโครงสร้างโซนทั้งชุด (เช่น รวมหลายโซนเล็กเป็นโซนใหญ่) ต้อง migrate ข้อมูล polygon ทั้งหมดใน [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]] พร้อมกับ cache ที่เกี่ยวข้องทั้งหมด

## ขั้นตอน

1) หยุด evaluate event ใหม่ของลูกค้ารายนั้นชั่วคราว 2) export polygon เดิมสำรองไว้ 3) import ผังใหม่ 4) รัน replay test ด้วย ping ย้อนหลัง 24 ชั่วโมงเทียบผลลัพธ์เดิมกับใหม่ก่อนเปิดใช้งานจริง
