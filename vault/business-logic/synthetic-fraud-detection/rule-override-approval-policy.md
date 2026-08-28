---
layer: business-logic
tags: [rule-engine, approval, policy]
created: 2026-01-03
links:
  - "[[structure/synthetic-fraud-detection/module-rule-engine]]"
  - "[[business-logic/synthetic-fraud-detection/rule-override-approval-policy-edge-cases]]"
---

# นโยบายการ Override Rule และการอนุมัติ

การ deactivate หรือ override rule ที่ active อยู่ต้องได้รับการอนุมัติจากหัวหน้าทีม Fraud Operations หรือ Risk & Compliance ล่วงหน้า ห้ามทำโดยตรงผ่าน admin console โดยไม่มีกระบวนการนี้ เพราะ rule บาง rule ถูกออกแบบตอบสนองต่อ regulatory requirement

ทุกการเปิด/ปิด/แก้ไข rule ถูก log โดย [[structure/synthetic-fraud-detection/module-rule-engine]] พร้อม timestamp, ผู้ดำเนินการ, และ approver — log นี้ไม่สามารถแก้ไขได้ เพราะเป็นส่วนหนึ่งของ compliance evidence

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fraud-detection/rule-override-approval-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
