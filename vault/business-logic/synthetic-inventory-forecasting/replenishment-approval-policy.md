---
layer: business-logic
tags: [replenishment, approval, policy]
created: 2025-11-22
links:
  - "[[business-logic/synthetic-inventory-forecasting/replenishment-approval-policy-edge-cases]]"
---

# นโยบายการอนุมัติคำแนะนำเติมสินค้า

คำแนะนำเติมสินค้าที่มีมูลค่ารวมเกิน `REPLENISHMENT_APPROVAL_THRESHOLD_USD` ต้องผ่านการอนุมัติจากผู้จัดการหมวดสินค้าก่อนจึงจะเปลี่ยนสถานะเป็น `approved` และส่งต่อให้ ERP สร้าง PO จริงได้

คำแนะนำที่ต่ำกว่า threshold ส่งตรงไป `sent_to_supplier` อัตโนมัติโดยไม่ต้องรอคนอนุมัติ เพื่อไม่ให้ operation ประจำวันช้าลงโดยไม่จำเป็น

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-inventory-forecasting/replenishment-approval-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
