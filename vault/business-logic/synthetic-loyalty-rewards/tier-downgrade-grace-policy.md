---
layer: business-logic
tags: [tier, downgrade, grace-period, policy]
created: 2025-10-03
links:
  - "[[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy-edge-cases]]"
---

# นโยบาย Grace Period เมื่อ Tier ลดระดับ

สมาชิกที่ยอดแต้มสะสมรอบปีต่ำกว่า threshold ของ tier ปัจจุบันจะได้รับ grace period `DOWNGRADE_GRACE_PERIOD_DAYS` วันก่อน tier จะลดจริง ช่วงนี้สมาชิกยังใช้สิทธิ์ tier เดิมได้ทุกอย่างและยังมีโอกาสกลับมาถึง threshold

grace period เริ่มนับจากวันที่ประเมิน tier พบว่าต่ำกว่า threshold ครั้งแรก ถ้าสมาชิกกลับขึ้นมาเองก่อน grace period หมด grace period จะยุติโดยอัตโนมัติโดยไม่ต้องทำ formal request

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
