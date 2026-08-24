---
layer: business-logic
tags: [fraud, threshold, policy]
created: 2026-01-04
links:
  - "[[structure/synthetic-ad-bidding/module-fraud-filter]]"
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
  - "[[business-logic/synthetic-ad-bidding/fraud-score-threshold-policy-edge-cases]]"
---

# นโยบาย Threshold คะแนน Fraud

[[structure/synthetic-ad-bidding/module-fraud-filter]] ให้คะแนน fraud score 0-100 กับทุก request คะแนนตั้งแต่ `FRAUD_SCORE_BLOCK_THRESHOLD` (ค่า default 80) ขึ้นไปจะถูก block ทันทีไม่ส่งต่อไป [[structure/synthetic-ad-bidding/module-auction-engine]] เลย

คะแนนระหว่าง 50-79 ถือเป็น `suspicious` — ยังให้ประมูลได้ตามปกติ แต่ราคาที่เสนอจะถูกลดทอนลง (bid shading) ตามสัดส่วนคะแนน เพื่อลดความเสี่ยงโดยไม่ปิดโอกาสธุรกิจไปเลยทั้งหมด

## ทำไมไม่ block ทันทีที่คะแนนเกินครึ่ง

ข้อมูลในอดีตพบว่า traffic คะแนน 50-79 จำนวนไม่น้อยเป็น false positive จาก proxy องค์กรใหญ่หรือ VPN ที่คนใช้งานจริง การ block ตรงนี้ทันทีจะเสีย traffic จริงไปเยอะเกินจำเป็น bid shading จึงเป็นทางสายกลางที่ทีมเลือกใช้

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-ad-bidding/fraud-score-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
