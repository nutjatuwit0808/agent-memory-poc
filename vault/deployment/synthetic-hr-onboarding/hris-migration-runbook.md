---
layer: deployment
tags: [migration, runbook]
created: 2026-02-10
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
  - "[[structure/synthetic-hr-onboarding/module-access-provisioning]]"
---

# HRIS Data Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อบริษัทเปลี่ยนหรืออัปเกรด HRIS หลัก ต้อง migrate mapping ระหว่าง `roleId` เดิมกับ role code ใหม่ใน [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] และ [[structure/synthetic-hr-onboarding/module-access-provisioning]] พร้อมกัน

## ขั้นตอน

1) หยุดรับ case ใหม่ชั่วคราว 2) export mapping เดิมสำรองไว้ 3) import mapping ใหม่จาก HRIS 4) รัน case ทดสอบใน staging ให้ครบทุก role ก่อนเปิดรับ case จริง
