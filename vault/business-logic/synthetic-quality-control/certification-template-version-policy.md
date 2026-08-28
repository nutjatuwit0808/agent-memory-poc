---
layer: business-logic
tags: [certification, template, policy]
created: 2026-07-04
links:
  - "[[structure/synthetic-quality-control/module-certification-generator]]"
  - "[[business-logic/synthetic-quality-control/certification-template-version-policy-edge-cases]]"
---

# นโยบายเวอร์ชัน Template ใบรับรอง

ใบรับรองแต่ละใบต้องใช้ template เวอร์ชันที่ลูกค้าปลายทางยอมรับ ไม่ใช่ template เวอร์ชันล่าสุดเสมอไป เพราะลูกค้าบางรายต้องผ่านการตรวจสอบภายในของตัวเองก่อนจะอัปเดต approved template version

[[structure/synthetic-quality-control/module-certification-generator]] เก็บ mapping ระหว่าง `customerId` กับ `templateVersion` ที่ approved สำหรับลูกค้าแต่ละราย ถ้า template version ที่ร้องขอไม่อยู่ใน approved list จะ reject ทันที

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-quality-control/certification-template-version-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
