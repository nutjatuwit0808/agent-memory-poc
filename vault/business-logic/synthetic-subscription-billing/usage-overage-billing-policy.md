---
layer: business-logic
tags: [usage, policy]
created: 2026-06-15
links:
  - "[[business-logic/synthetic-subscription-billing/usage-overage-billing-policy-edge-cases]]"
---

# นโยบายการคิดเงินส่วนเกินโควตา

การใช้งานที่เกินโควตาของแพลนจะถูกคิดเงินเพิ่มตามอัตราส่วนเกินที่กำหนดต่อแพลน คำนวณจากยอดรวมทั้งรอบบิล ไม่ใช่คิดทันทีที่เกินโควตาในแต่ละวัน

ลูกค้าได้รับแจ้งเตือนเมื่อการใช้งานถึง `USAGE_THRESHOLD_ALERT_PERCENT` ของโควตา เพื่อให้มีโอกาสอัปเกรดแพลนหรือปรับการใช้งานก่อนถูกคิดเงินส่วนเกินจริงตอนออกใบแจ้งหนี้

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-subscription-billing/usage-overage-billing-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
