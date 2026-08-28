---
layer: business-logic
tags: [maintenance, contract, policy]
created: 2026-05-03
links:
  - "[[business-logic/synthetic-asset-management/maintenance-renewal-notice-policy-edge-cases]]"
---

# นโยบายการแจ้งเตือนต่อสัญญาบำรุงรักษา

สัญญาบำรุงรักษาของสินทรัพย์ที่ใกล้หมดอายุจะถูกแจ้งเตือนล่วงหน้า 90 วัน ผ่าน email ถึงเจ้าของสินทรัพย์และทีม IT procurement — เพื่อให้มีเวลาเพียงพอในการเจรจาต่อสัญญาหรือหาตัวเลือกอื่น

ถ้าไม่มีการดำเนินการใดๆ ภายใน 60 วัน ระบบจะ escalate ไปยัง IT manager อีกชั้นหนึ่ง และที่ 30 วัน จะ escalate ไปยัง CTO เพื่อให้มั่นใจว่าสัญญาสำคัญไม่หมดโดยไม่มีใครรู้

## ทำไมต้องแจ้ง 90 วันล่วงหน้า

สัญญาบำรุงรักษาของ enterprise hardware โดยเฉพาะ server และ network equipment ใช้เวลา negotiate และออก PO นานกว่าปกติมาก บางรายต้องผ่าน legal review ด้วย — 90 วันเป็นเกณฑ์ขั้นต่ำที่ทีมประมาณไว้ว่าพอใช้ได้จริงในกรณีส่วนใหญ่

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-asset-management/maintenance-renewal-notice-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
