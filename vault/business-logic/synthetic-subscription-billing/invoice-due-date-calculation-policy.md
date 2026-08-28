---
layer: business-logic
tags: [invoice, policy]
created: 2026-02-18
links:
  - "[[business-logic/synthetic-subscription-billing/invoice-due-date-calculation-policy-edge-cases]]"
---

# นโยบายการคำนวณวันครบกำหนดชำระ

ใบแจ้งหนี้มีกำหนดชำระ 15 วันนับจากวันที่ออกใบแจ้งหนี้สำหรับลูกค้าทั่วไป ส่วนลูกค้าองค์กรที่มีสัญญาระบุเงื่อนไขการชำระพิเศษ (เช่น net-30) ใช้ตามที่ระบุในสัญญาแทน

วันครบกำหนดชำระคำนวณจากวันที่ระบบสร้างใบแจ้งหนี้จริง ไม่ใช่วันที่ควรจะสร้างตามตารางเวลาปกติ ถ้าใบแจ้งหนี้ออกช้ากว่ากำหนดเพราะปัญหาระบบ วันครบกำหนดชำระจะขยับตามไปด้วยโดยอัตโนมัติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-subscription-billing/invoice-due-date-calculation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
