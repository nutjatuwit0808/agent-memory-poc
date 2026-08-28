---
layer: business-logic
tags: [inspection, checklist, policy]
created: 2026-01-31
links:
  - "[[structure/synthetic-fleet-maintenance/module-inspection-recorder]]"
  - "[[business-logic/synthetic-fleet-maintenance/inspection-checklist-version-policy-edge-cases]]"
---

# นโยบายเวอร์ชัน Inspection Checklist

การตรวจสภาพต้องใช้ checklist เวอร์ชันล่าสุดที่ active สำหรับ vehicle type นั้นเสมอ [[structure/synthetic-fleet-maintenance/module-inspection-recorder]] ตรวจสอบ version ที่ส่งมาก่อนบันทึกผลเสมอ ถ้า version ไม่ตรงจะ reject ทันทีพร้อมระบุ version ที่ถูกต้อง

checklist version ใหม่จะ activate พร้อมกันทั้งฝูงรถในวันที่กำหนด ไม่มีการเปลี่ยนทีละคัน เพื่อให้เปรียบเทียบผลตรวจข้ามคันได้โดยใช้ checklist เดียวกัน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fleet-maintenance/inspection-checklist-version-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
