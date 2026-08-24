---
layer: business-logic
tags: [language, routing, policy]
created: 2025-12-24
links:
  - "[[structure/synthetic-chat-support-bot/module-intent-classifier]]"
---

# นโยบายการจัดเส้นทางตามภาษา

[[structure/synthetic-chat-support-bot/module-intent-classifier]] ใช้ `detectLanguage` ก่อนจำแนก intent เสมอ ถ้าภาษาที่ตรวจพบไม่อยู่ใน `SUPPORTED_LANGUAGE_CODES` จะส่งต่อเจ้าหน้าที่ทันทีโดยไม่พยายามจำแนก intent ต่อ เพราะโมเดลที่ฝึกมาสำหรับภาษาที่รองรับให้ผลลัพธ์ไม่น่าเชื่อถือกับภาษาอื่น

การ retrieve บทความจาก knowledge base ต้องกรองตามภาษาที่ตรวจพบด้วยเสมอ ไม่ส่งบทความภาษาอื่นมาตอบแม้เนื้อหาจะเกี่ยวข้องก็ตาม
