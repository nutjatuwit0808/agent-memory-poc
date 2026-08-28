---
layer: business-logic
tags: [scoring, threshold, policy]
created: 2025-09-28
links:
  - "[[structure/synthetic-fraud-detection/module-case-manager]]"
  - "[[business-logic/synthetic-fraud-detection/score-threshold-policy-edge-cases]]"
---

# นโยบาย Score Threshold สำหรับ Block/Review/Allow

[[structure/synthetic-fraud-detection/module-case-manager]] ใช้ combined score (weighted average ของ rule score และ ML score) เพื่อตัดสินใจ action: score ≥ 80 → block ทันที, score 50-79 → ส่ง analyst review queue, score < 50 → allow โดยไม่มีการดำเนินการเพิ่มเติม

threshold เหล่านี้เป็น policy-level decision ไม่ใช่ technical config ที่เปลี่ยนได้โดยไม่มีกระบวนการ — การเปลี่ยนต้องผ่าน Data Science team และ Risk & Compliance อนุมัติทุกครั้ง เพราะส่งผลโดยตรงต่อ false positive และ false negative rate

## Weighted average ระหว่าง rule score และ ML score

ปัจจุบัน weight คือ rule: 40%, ML: 60% — น้ำหนัก ML สูงกว่าเพราะ model มี recall ที่ดีกว่า rule สำหรับ fraud pattern ใหม่ๆ แต่ rule ยังสำคัญเพราะ explainability สำหรับทีม ops และ regulator

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fraud-detection/score-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
