---
layer: business-logic
tags: [parts, inventory, policy]
created: 2026-04-29
links:
  - "[[structure/synthetic-fleet-maintenance/module-parts-inventory]]"
  - "[[structure/synthetic-fleet-maintenance/module-reorder-trigger]]"
  - "[[business-logic/synthetic-fleet-maintenance/parts-minimum-stock-policy-edge-cases]]"
---

# นโยบายสต็อกอะไหล่ขั้นต่ำ

อะไหล่แต่ละชิ้นมี reorder point และ minimum stock level ที่ตั้งไว้ตาม lead time ของ vendor และ average consumption rate ของฝูงรถ [[structure/synthetic-fleet-maintenance/module-parts-inventory]] จะ publish event `stock.below_reorder_point` เมื่อสต็อกต่ำกว่า reorder point หลังจาก deduction แต่ละครั้ง

สต็อกที่ต่ำกว่า minimum level (ซึ่งต่ำกว่า reorder point อีก) ถือว่า critical และ [[structure/synthetic-fleet-maintenance/module-reorder-trigger]] จะ escalate purchase request เป็น urgent ทันทีโดยไม่รอการอนุมัติปกติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fleet-maintenance/parts-minimum-stock-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
