---
layer: convention
tags: [zone, identifiers]
created: 2026-04-17
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[structure/synthetic-smart-building/module-occupancy-sensor-hub]]"
  - "[[structure/synthetic-smart-building/module-access-control-gateway]]"
  - "[[deployment/synthetic-smart-building/floor-plan-migration-runbook]]"
---

# Building Zone ID Convention

ทุก module ที่อ้างอิงพื้นที่ทางกายภาพต้องใช้รูปแบบ `zoneId` เดียวกันเป๊ะ — เอกสารนี้กำหนดรูปแบบกลางที่ [[structure/synthetic-smart-building/module-hvac-controller]], [[structure/synthetic-smart-building/module-occupancy-sensor-hub]], และ [[structure/synthetic-smart-building/module-access-control-gateway]] ต้องใช้ร่วมกัน

## รูปแบบ

`<อาคาร>-<ชั้น>-<โซนย่อย>` เช่น `HQ-12-A` โดย `<อาคาร>` ใช้รหัสย่อ 2-4 ตัวอักษร ตัวพิมพ์ใหญ่ ตรงกับรหัสในระบบ property management ภายนอกเสมอ

## การเปลี่ยนผัง

ถ้าอาคารปรับผังชั้นวางใหม่จนโซนย่อยเปลี่ยน ห้ามเปลี่ยนความหมายของ `zoneId` เดิม — ต้อง deprecate แล้วสร้าง zoneId ใหม่เสมอ ดูขั้นตอนที่ [[deployment/synthetic-smart-building/floor-plan-migration-runbook]]
