---
layer: business-logic
tags: [state, edge-case]
created: 2025-11-27
links:
  - "[[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]]"
  - "[[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy]]"
---

# ข้อยกเว้นสำหรับบทสนทนาที่กำลังรอเจ้าหน้าที่

บทสนทนาที่อยู่ในสถานะ `queued` รอเจ้าหน้าที่ตาม [[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]] จะไม่ถูก mark เป็น `expired` แม้จะเกิน threshold ปกติ เพราะการไม่มีข้อความใหม่ระหว่างรอคิวเป็นเรื่องปกติ ไม่ใช่สัญญาณว่าลูกค้าทิ้งบทสนทนาไปแล้ว

บทสนทนาที่เจ้าหน้าที่กำลังคุยอยู่ (`active_human`) ใช้ threshold ยาวกว่าปกติ 3 เท่า เพราะเจ้าหน้าที่อาจต้องใช้เวลาค้นข้อมูลก่อนตอบ การหมดอายุเร็วเกินไปจะตัดบทสนทนาที่ยังไม่จบทิ้งโดยไม่ตั้งใจ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy]] ("นโยบายอายุของ State การสนทนา") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
