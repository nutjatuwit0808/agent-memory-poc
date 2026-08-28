---
layer: business-logic
tags: [partner, conversion, points, policy]
created: 2025-09-03
links:
  - "[[business-logic/synthetic-loyalty-rewards/points-earning-rate-policy]]"
  - "[[structure/synthetic-loyalty-rewards/module-partner-sync]]"
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
  - "[[business-logic/synthetic-loyalty-rewards/partner-conversion-policy-edge-cases]]"
---

# นโยบาย Conversion Rate แต้มจาก Partner

แต้มที่ได้จากการซื้อผ่าน partner brand ใช้ conversion rate ตามสัญญาของ partner แต่ละราย ซึ่งอาจต่างจากอัตรา default ของ [[business-logic/synthetic-loyalty-rewards/points-earning-rate-policy]] — partner ประเภท airline อาจแปลง 1 mile เป็น 2 PointsVault points ในขณะที่ partner ประเภท hotel อาจ 1:1

[[structure/synthetic-loyalty-rewards/module-partner-sync]] ส่งค่า raw transaction amount มาพร้อม `partnerId` ให้ [[structure/synthetic-loyalty-rewards/module-points-ledger]] เป็นผู้ apply conversion rate ที่ถูกต้อง ไม่ใช่ให้ partner คำนวณ points มาเอง เพื่อรักษา single source of truth ของ conversion rule

## Pending confirmation window

แต้มจาก partner อยู่ใน pending สูงสุด `PENDING_CREDIT_TTL_HOURS` ก่อนยืนยัน ถ้า partner ไม่ยืนยันในเวลานั้น pending credit จะถูก void อัตโนมัติ และสมาชิกจะได้รับแจ้งเตือน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-loyalty-rewards/partner-conversion-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
