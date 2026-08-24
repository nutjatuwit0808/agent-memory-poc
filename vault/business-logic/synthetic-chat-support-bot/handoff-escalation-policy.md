---
layer: business-logic
tags: [handoff, escalation, policy]
created: 2026-04-26
links:
  - "[[structure/synthetic-chat-support-bot/module-handoff-router]]"
  - "[[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]]"
  - "[[business-logic/synthetic-chat-support-bot/handoff-escalation-policy-edge-cases]]"
---

# นโยบายการยกระดับ Handoff

บทสนทนาที่รออยู่ใน `queued` เกิน `HANDOFF_QUEUE_ALERT_THRESHOLD_MIN` (ค่าปกติ 5 นาที) จะถูก [[structure/synthetic-chat-support-bot/module-handoff-router]] แจ้งเตือนหัวหน้าทีมอัตโนมัติ และเพิ่ม priority ให้เป็นคิวถัดไปที่ได้รับมอบหมายก่อนบทสนทนาที่รอน้อยกว่า

handoff ถูกจัดหมวดเป็น 3 ระดับตามเหตุผล: `general` (คำถามทั่วไปที่ bot ตอบไม่ได้), `escalation` (ลูกค้าขอคุยกับคนโดยตรงหรือไม่พอใจ bot), และ `high_risk` (เข้าเงื่อนไขความเสี่ยงสูงตาม [[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]])

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-chat-support-bot/handoff-escalation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
