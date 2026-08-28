---
layer: business-logic
tags: [redemption, threshold, policy]
created: 2025-11-14
links:
  - "[[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy-edge-cases]]"
---

# นโยบายเกณฑ์ขั้นต่ำและสิทธิ์การแลกรางวัล

สมาชิกต้องมียอดแต้มอย่างน้อย `MIN_REDEMPTION_POINTS` จึงจะแลกรางวัลได้ ยอดนี้ต้องเป็น confirmed points เท่านั้น ไม่นับ pending points จาก partner ที่ยังไม่ยืนยัน เพราะ pending points อาจถูก void ในภายหลัง

แต่ละบัญชีแลกรางวัลได้สูงสุด `MAX_DAILY_REDEMPTIONS_PER_ACCOUNT` ครั้งต่อวัน เพื่อลดความเสี่ยงจากบัญชีที่อาจถูก compromise แลก redemption หมดในคืนเดียว

## สิทธิ์พิเศษตาม Tier

Gold ขึ้นไปสามารถแลกรางวัลในหมวด Exclusive ที่ Bronze และ Silver เข้าไม่ถึง Platinum มีสิทธิ์ reserve รางวัล limited quantity ล่วงหน้า 48 ชั่วโมงก่อน general release

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
