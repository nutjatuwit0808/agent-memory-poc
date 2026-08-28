---
layer: convention
tags: [segment, definition, style]
created: 2025-12-24
links:
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
---

# Segment Definition Format

รูปแบบของ segment definition ต้องเป็น structured rule ที่ [[structure/synthetic-customer-segmentation/module-membership-refresher]] evaluate ได้โดยอัตโนมัติ ห้ามใช้ free-text หรือ SQL โดยตรง

## โครงสร้าง rule

แต่ละ rule ต้องมี `eventType`, `condition`, และ `window` เช่น `{ eventType: 'purchase', condition: { minCount: 3 }, window: { days: 30 } }` — ไม่มี implicit default ทุก field ต้องระบุชัดเจน

## Operator

ใช้ `AND` เมื่อต้องการ customer ที่ตรงทุก rule พร้อมกัน, `OR` เมื่อพอตรงข้อใดข้อหนึ่งก็ได้ — ห้ามผสม operator ใน nested rule เดียวกัน ต้องสร้าง segment ใหม่แทน
