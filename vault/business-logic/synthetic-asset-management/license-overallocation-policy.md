---
layer: business-logic
tags: [license, compliance, policy]
created: 2026-07-02
links:
  - "[[structure/synthetic-asset-management/module-license-pool-manager]]"
  - "[[business-logic/synthetic-asset-management/license-overallocation-policy-edge-cases]]"
---

# นโยบายเกณฑ์ License Overallocation

[[structure/synthetic-asset-management/module-license-pool-manager]] แจ้งเตือนทีม IT เมื่อ seat ที่ใช้ไปเกิน `LICENSE_WARNING_THRESHOLD_PCT` ของทั้งหมด และบล็อก allocation ใหม่เมื่อถึง 100% โดยอัตโนมัติ — ไม่มีการ allow overallocation แม้แต่ชั่วคราว เพราะนำไปสู่ license audit failure ได้

เมื่อ pool ถึงเกณฑ์เตือน ระบบจะสร้าง procurement request แบบ pre-filled สำหรับ license เพิ่มเติมให้อัตโนมัติ เพื่อย่นระยะเวลา lead time ของการซื้อเพิ่ม ทีม IT ต้องยืนยัน request นั้นเองก่อน submit

## ทำไมไม่ allow overallocation ชั่วคราว

การ overallocate แม้แต่ชั่วคราวทำให้รายงาน license audit ที่ส่งให้ vendor ผิดจาก reality — ผลคือโดนค่าปรับและเสียเงื่อนไขต่อรองราคา ต้นทุนของการ overallocate แค่ชั่วคราวจึงสูงกว่าต้นทุนที่ต้องรอ procurement มาก

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-asset-management/license-overallocation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
