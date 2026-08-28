---
layer: business-logic
tags: [procurement, approval, policy]
created: 2026-08-01
links:
  - "[[structure/synthetic-asset-management/module-procurement-handler]]"
  - "[[business-logic/synthetic-asset-management/procurement-approval-tier-policy-edge-cases]]"
---

# นโยบาย Tier การอนุมัติ Procurement Request

[[structure/synthetic-asset-management/module-procurement-handler]] กำหนด approval tier ตามมูลค่ารวมของ request — Tier 1 (ไม่เกิน `PROCUREMENT_TIER1_LIMIT_THB`) manager อนุมัติได้, Tier 2 (เกิน Tier 1 แต่ไม่เกิน `PROCUREMENT_TIER2_LIMIT_THB`) ต้องมี director อนุมัติ, Tier 3 (เกิน Tier 2) ต้องมี C-level อนุมัติ

ระบบจะไม่อนุญาตให้ approver ที่มีสิทธิ์ Tier 1 อนุมัติ request Tier 2 แม้จะ override ผ่าน admin panel ก็ตาม — เป็นข้อกำหนดที่ hard-code ไว้เพื่อป้องกัน audit finding

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-asset-management/procurement-approval-tier-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
