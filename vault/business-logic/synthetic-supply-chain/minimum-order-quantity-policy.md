---
layer: business-logic
tags: [moq, purchase-order, policy]
created: 2026-03-01
links:
  - "[[structure/synthetic-supply-chain/module-supplier-catalog]]"
  - "[[business-logic/synthetic-supply-chain/minimum-order-quantity-policy-edge-cases]]"
---

# นโยบาย Minimum Order Quantity (MOQ)

ซัพพลายเออร์แต่ละรายกำหนด MOQ ต่อ SKU ซึ่งบันทึกใน [[structure/synthetic-supply-chain/module-supplier-catalog]] ระบบจะปฏิเสธการสร้าง PO ที่มีจำนวนต่ำกว่า MOQ โดยอัตโนมัติและแสดง error code `SUPPLY_PO_BELOW_MOQ` พร้อม MOQ จริงที่ต้องใช้

ในกรณีที่ demand จริงต่ำกว่า MOQ ทีม procurement ต้องตัดสินใจระหว่างสองทาง คือ รอให้ demand สะสมจนถึง MOQ (ซึ่งอาจทำให้สต็อกหมดก่อน) หรือสั่ง MOQ แล้วแบก overstock ชั่วคราว ทั้งสองทางมี cost ที่ต่างกัน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-supply-chain/minimum-order-quantity-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
