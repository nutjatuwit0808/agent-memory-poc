---
layer: business-logic
tags: [vendor, procurement, policy]
created: 2026-05-09
links:
  - "[[structure/synthetic-fleet-maintenance/module-reorder-trigger]]"
  - "[[business-logic/synthetic-fleet-maintenance/vendor-approval-non-stocked-parts-policy-edge-cases]]"
---

# นโยบายการอนุมัติ Vendor สำหรับอะไหล่นอกสต็อก

อะไหล่ที่ไม่อยู่ใน approved vendor list ต้องผ่านการอนุมัติจาก Purchasing Manager ก่อนสั่งซื้อ [[structure/synthetic-fleet-maintenance/module-reorder-trigger]] จะ hold purchase request และแจ้งให้อนุมัติ vendor ก่อนดำเนินการ เพื่อป้องกันการใช้อะไหล่ที่ไม่ผ่านมาตรฐาน

vendor ที่ approved แล้วสำหรับ part type หนึ่งไม่ได้ approved อัตโนมัติสำหรับ part type อื่น — approval ผูกกับ part category ไม่ใช่ vendor ทั้งหมด

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fleet-maintenance/vendor-approval-non-stocked-parts-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
