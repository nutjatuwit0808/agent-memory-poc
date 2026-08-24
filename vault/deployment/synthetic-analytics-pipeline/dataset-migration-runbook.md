---
layer: deployment
tags: [migration, runbook]
created: 2026-01-01
links:
  - "[[structure/synthetic-analytics-pipeline/module-schema-registry]]"
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
---

# Dataset Schema Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อต้องเปลี่ยน schema ของ dataset ที่มีอยู่แล้วแบบ breaking change (ลบคอลัมน์, เปลี่ยนชนิดข้อมูล) ต้อง migrate ทั้ง [[structure/synthetic-analytics-pipeline/module-schema-registry]] และ mapping ของ [[structure/synthetic-analytics-pipeline/module-transform-engine]] พร้อมกัน

## ขั้นตอน

1) แจ้งทีมที่ใช้ dataset ล่วงหน้าอย่างน้อย 2 สัปดาห์ 2) เปิดใช้ schema ใหม่แบบ dual-write คู่ขนานกับของเดิมชั่วคราว 3) ตรวจสอบว่าทุก consumer ย้ายมาใช้ schema ใหม่ครบแล้ว 4) ปิด schema เดิม
