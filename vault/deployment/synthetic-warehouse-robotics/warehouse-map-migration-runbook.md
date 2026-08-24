---
layer: deployment
tags: [migration, runbook]
created: 2026-02-21
links:
  - "[[structure/synthetic-warehouse-robotics/module-inventory-sync]]"
  - "[[structure/synthetic-warehouse-robotics/module-fleet-controller]]"
---

# Warehouse Map Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อคลังปรับผังชั้นวางใหม่ (เพิ่ม/ย้าย aisle) ต้อง migrate ข้อมูล bin mapping ทั้งหมดใน [[structure/synthetic-warehouse-robotics/module-inventory-sync]] และแผนที่เส้นทางของ [[structure/synthetic-warehouse-robotics/module-fleet-controller]] พร้อมกัน

## ขั้นตอน

1) หยุดรับ task ใหม่ชั่วคราว 2) export mapping เดิมสำรองไว้ 3) import ผังใหม่ 4) รันหุ่นยนต์ทดสอบเส้นทางในโซนที่เปลี่ยน 3-5 รอบก่อนเปิดรับงานจริง
