---
layer: deployment
tags: [supplier, runbook]
created: 2025-11-06
links:
  - "[[convention/synthetic-travel-booking/supplier-integration-convention]]"
  - "[[deployment/synthetic-travel-booking/inventory-schema-migration-runbook]]"
---

# Supplier Onboarding Runbook

ขั้นตอนมาตรฐานสำหรับเชื่อมต่อซัพพลายเออร์รายใหม่ อ้างอิงตาม [[convention/synthetic-travel-booking/supplier-integration-convention]]

## ก่อนเปิดใช้งานจริง

ต้องผ่าน contract test ครบตาม [[convention/synthetic-travel-booking/supplier-integration-convention]] และรัน migration ตาม [[deployment/synthetic-travel-booking/inventory-schema-migration-runbook]] ถ้า schema ต่างจากเดิม

## ช่วงทดลองใช้งาน

เปิดให้ซัพพลายเออร์ใหม่ปรากฏในผลค้นหาแบบจำกัด (ไม่เกิน 10% ของ traffic) เป็นเวลา 1 สัปดาห์ก่อน เฝ้าดู discrepancy rate เทียบกับซัพพลายเออร์ที่มีอยู่เดิม ถ้าสูงผิดปกติให้หยุดขยายทันที
