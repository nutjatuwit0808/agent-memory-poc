---
layer: business-logic
tags: [quality, rejection, policy]
created: 2026-02-17
links:
  - "[[structure/synthetic-supply-chain/module-quality-inspection-gate]]"
  - "[[structure/synthetic-supply-chain/module-goods-receipt-processor]]"
  - "[[structure/synthetic-supply-chain/module-supplier-catalog]]"
  - "[[business-logic/synthetic-supply-chain/quality-rejection-policy-edge-cases]]"
---

# นโยบายการปฏิเสธสินค้าที่ไม่ผ่านคุณภาพ

เมื่อ [[structure/synthetic-supply-chain/module-quality-inspection-gate]] พบ defect rate เกิน AQL threshold ของ SKU นั้น จะออก rejection notice ให้ [[structure/synthetic-supply-chain/module-goods-receipt-processor]] และ publish event `inspection.rejected` ซัพพลายเออร์ต้องรับสินค้าคืนและส่งสินค้าทดแทนภายใน timeline ที่กำหนดในสัญญา

Rejection แต่ละครั้งถูกบันทึกเป็น penalty event ใน [[structure/synthetic-supply-chain/module-supplier-catalog]] และส่งผลต่อ performance score ของซัพพลายเออร์นั้นด้วย ถ้า rejection rate ของซัพพลายเออร์เกิน 15% ในไตรมาสเดียว จะถูก flag เป็น probation อัตโนมัติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-supply-chain/quality-rejection-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
