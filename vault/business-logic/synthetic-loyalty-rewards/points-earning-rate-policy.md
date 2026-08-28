---
layer: business-logic
tags: [points, earning, tier, policy]
created: 2026-03-13
links:
  - "[[business-logic/synthetic-loyalty-rewards/bonus-campaign-eligibility-policy]]"
  - "[[business-logic/synthetic-loyalty-rewards/points-earning-rate-policy-edge-cases]]"
---

# นโยบายอัตราการสะสมแต้มตาม Tier

อัตราการได้แต้มต่อยอดซื้อปรับตาม tier ของสมาชิก — Bronze ได้ 1 แต้มต่อ 25 บาท, Silver 1 ต่อ 20 บาท, Gold 1 ต่อ 15 บาท และ Platinum 1 ต่อ 10 บาท อัตรานี้ใช้กับทุก partner ที่ไม่ได้กำหนด rate แยก

แต้มคำนวณจากยอดซื้อ net (หลังหักส่วนลดและ voucher แล้ว) ไม่ใช่จากราคา tag เพื่อไม่ให้สมาชิกได้แต้มมากขึ้นจากการใช้ส่วนลด partner บางรายอาจมี multiplier พิเศษช่วง campaign ดู [[business-logic/synthetic-loyalty-rewards/bonus-campaign-eligibility-policy]]

## แต้มสูงสุดต่อ transaction

transaction เดียวได้แต้มสูงสุด `MAX_SINGLE_CREDIT_POINTS` แม้ยอดซื้อจะสูงกว่านั้น เพื่อป้องกันความเสียหายจาก bulk purchase ที่ผิดปกติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-loyalty-rewards/points-earning-rate-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
