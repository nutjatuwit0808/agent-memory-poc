---
layer: business-logic
tags: [state, ttl, policy]
created: 2026-05-23
links:
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
  - "[[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy-edge-cases]]"
---

# นโยบายอายุของ State การสนทนา

บทสนทนาที่ไม่มีข้อความใหม่จากฝั่งใดฝั่งหนึ่งนานเกิน `STALE_CONVERSATION_THRESHOLD_MIN` (ค่าปกติ 30 นาที) จะถูก [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] เปลี่ยนสถานะเป็น `expired` อัตโนมัติ ไม่ถือว่าเป็นบทสนทนาที่ยัง active ต่อ

บทสนทนาที่ `expired` แล้วถ้าลูกค้าพิมพ์กลับเข้ามาอีกจะถูกสร้างเป็นบทสนทนาใหม่เสมอ ไม่ resume ของเดิม เพื่อไม่ให้ bot ตอบโดยอิงบริบทเก่าที่อาจไม่เกี่ยวข้องกับสิ่งที่ลูกค้ากำลังถามแล้ว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
