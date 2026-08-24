---
layer: business-logic
tags: [budget, pacing, policy]
created: 2025-11-23
links:
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
  - "[[business-logic/synthetic-ad-bidding/budget-pacing-policy-edge-cases]]"
---

# นโยบาย Pacing การใช้ Budget แคมเปญ

[[structure/synthetic-ad-bidding/module-budget-pacer]] คำนวณ throttle rate ทุก `PACING_SYNC_INTERVAL_MS` (ค่า default 1000ms) โดยเทียบ spend สะสมจริงกับเส้น pacing ที่คาดไว้ (ideal pacing curve แบบ even distribution ตลอด 24 ชั่วโมง) ถ้า spend เร็วกว่าเส้นคาด throttle rate จะลดลงทันที

AdPulse ยอมรับ overspend ได้ไม่เกิน `PACING_OVERSPEND_TOLERANCE_PCT` (ค่า default 2%) ของ daily budget ต่อแคมเปญ เกินกว่านี้ถือเป็นบั๊กที่ต้อง investigate ไม่ใช่ความคลาดเคลื่อนปกติของระบบ distributed

## ทำไมยอมรับ overspend เล็กน้อยแทนที่จะ block เด็ดขาด

การเช็ค budget แบบ strict ทุก request (ล็อกแถวเช็คทุกครั้งก่อนประมูล) จะทำให้ latency พุ่งเกิน time budget ที่มีแคบมากอยู่แล้ว ทีมเลือก eventual consistency แบบมี tolerance band แทน เพราะ overspend เล็กน้อยที่ควบคุมได้ ดีกว่า latency ที่ทำให้แคมเปญพลาดโอกาสประมูลทุก request

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-ad-bidding/budget-pacing-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
