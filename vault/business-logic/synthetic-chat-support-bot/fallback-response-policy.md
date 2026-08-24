---
layer: business-logic
tags: [bot, fallback, policy]
created: 2026-01-31
links:
  - "[[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]]"
---

# นโยบายคำตอบ Fallback เมื่อ Bot ตอบไม่ได้

เมื่อ [[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]] ไม่พบบทความที่เกี่ยวข้องเลย (ไม่ใช่แค่ confidence ต่ำ) bot จะใช้คำตอบ fallback มาตรฐานที่ยอมรับตรงๆ ว่าไม่พบข้อมูล แทนการพยายามสร้างคำตอบเดาจากบทความที่ไม่เกี่ยวข้อง

คำตอบ fallback ต้องเสนอทางเลือกให้ลูกค้าเลือกส่งต่อเจ้าหน้าที่ได้ทันทีเสมอ ไม่ปล่อยให้ลูกค้าติดอยู่กับ bot ที่ตอบไม่ได้โดยไม่มีทางออก
