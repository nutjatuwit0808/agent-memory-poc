---
layer: deployment
tags: [migration, runbook]
created: 2026-06-04
links:
  - "[[structure/synthetic-inventory-forecasting/module-feature-store]]"
  - "[[convention/synthetic-inventory-forecasting/feature-naming-convention]]"
---

# Feature Store Schema Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อต้องเพิ่ม/เปลี่ยนชื่อ/ลบ field ใน feature vector ต้อง migrate schema ของ [[structure/synthetic-inventory-forecasting/module-feature-store]] ตามขั้นตอนนี้เสมอ ห้ามแก้ schema ตรงๆ โดยไม่ประกาศล่วงหน้า

## ขั้นตอน

1) list consumer ทั้งหมดของ field ที่จะเปลี่ยน 2) ถ้า rename ให้เพิ่ม field ใหม่คู่ขนานตาม [[convention/synthetic-inventory-forecasting/feature-naming-convention]] ก่อน ไม่ลบของเก่าทันที 3) แจ้ง consumer ทุกทีมให้ย้ายไปใช้ field ใหม่ 4) ตั้งกำหนดเวลา deprecate field เก่าชัดเจนก่อนลบจริง
