---
layer: business-logic
tags: [campaign, bonus, eligibility, policy]
created: 2026-04-16
links:
  - "[[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]]"
  - "[[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]]"
  - "[[business-logic/synthetic-loyalty-rewards/bonus-campaign-eligibility-policy-edge-cases]]"
---

# นโยบายการเข้าร่วม Bonus Campaign

Bonus campaign คือช่วงเวลาพิเศษที่สมาชิกได้แต้มเพิ่มจากอัตราปกติ (เช่น 2x หรือ 3x points) แต่ไม่ใช่ทุก campaign เปิดให้ทุก tier — campaign บางรายการกำหนดให้เฉพาะ Gold ขึ้นไปหรือ Platinum เท่านั้น

สมาชิกที่อยู่ใน tier downgrade grace period ใช้สิทธิ์ campaign ตาม tier ปัจจุบัน (ก่อน downgrade จริง) ดู [[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]] เพื่อความสอดคล้องกับนโยบาย grace period โดยรวม

## Double-dipping กับ partner multiplier

สมาชิกที่ซื้อผ่าน partner ระหว่าง bonus campaign จะได้ทั้ง partner conversion rate ตาม [[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]] และ campaign multiplier ซ้อนกัน ซึ่งเป็นพฤติกรรมตั้งใจ ทั้งสองคำนวณแยกและรวมกันภายใต้เพดาน `MAX_SINGLE_CREDIT_POINTS` ต่อ transaction

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-loyalty-rewards/bonus-campaign-eligibility-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
