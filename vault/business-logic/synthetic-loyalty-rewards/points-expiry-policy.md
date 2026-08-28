---
layer: business-logic
tags: [expiry, points, policy]
created: 2026-08-17
links:
  - "[[structure/synthetic-loyalty-rewards/module-expiry-scheduler]]"
  - "[[business-logic/synthetic-loyalty-rewards/points-expiry-policy-edge-cases]]"
---

# นโยบายหมดอายุของแต้ม

แต้มที่ได้รับมีอายุตาม tier ของสมาชิก ณ เวลาที่ได้รับ: Bronze และ Silver มีอายุ 12 เดือนนับจากวันที่ได้รับแต้ม, Gold มีอายุ 18 เดือน, Platinum มีอายุ 24 เดือน อายุนี้ไม่เปลี่ยนตามการ upgrade/downgrade tier หลังจากได้รับแต้มแล้ว

[[structure/synthetic-loyalty-rewards/module-expiry-scheduler]] รันทุกเที่ยงคืนเพื่อตรวจและ expire แต้มที่ครบกำหนด สมาชิกจะได้รับแจ้งเตือนทาง email 30 วันและ 7 วันก่อนแต้มหมดอายุ

## FIFO expiry

แต้มที่ได้รับก่อนจะหมดอายุก่อนเสมอ (First-In-First-Out) เมื่อสมาชิกใช้แต้ม ระบบจะ debit จากกลุ่มแต้มที่จะหมดอายุเร็วที่สุดก่อน เพื่อช่วยสมาชิกรักษาแต้มที่หมดอายุช้ากว่า

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-loyalty-rewards/points-expiry-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
