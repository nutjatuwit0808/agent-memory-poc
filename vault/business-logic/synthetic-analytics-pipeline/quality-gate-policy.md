---
layer: business-logic
tags: [quality, gate, policy]
created: 2025-10-18
links:
  - "[[structure/synthetic-analytics-pipeline/module-data-quality-checker]]"
  - "[[structure/synthetic-analytics-pipeline/module-warehouse-loader]]"
  - "[[business-logic/synthetic-analytics-pipeline/quality-gate-policy-edge-cases]]"
---

# นโยบาย Quality Gate ก่อนโหลดเข้า Warehouse

ข้อมูลทุก dataset ต้องผ่าน [[structure/synthetic-analytics-pipeline/module-data-quality-checker]] ก่อนเข้าสู่ [[structure/synthetic-analytics-pipeline/module-warehouse-loader]] เสมอ ไม่มีทางลัดใดๆ แม้เป็น hotfix เร่งด่วน — check ที่ fail ระดับ `critical` (เช่น พบ PII ในคอลัมน์ที่ไม่ควรมี) จะบล็อกการโหลดทันทีโดยไม่มีข้อยกเว้น

check ที่ fail ระดับ `warning` (เช่น อัตรา null สูงกว่าปกติเล็กน้อย) ไม่บล็อกการโหลดอัตโนมัติ แต่ต้องมีคนอนุมัติผ่าน `overrideCheckFailure` ก่อนเสมอ เพื่อให้มีคนรับรู้ว่าข้อมูลรอบนี้คุณภาพต่ำกว่าปกติก่อนถูกใช้งานจริง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-analytics-pipeline/quality-gate-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
