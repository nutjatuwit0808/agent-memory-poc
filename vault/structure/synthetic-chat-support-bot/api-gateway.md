---
layer: structure
tags: [chat-support-bot, helploop, gateway, api]
created: 2025-11-12
links:
  - "[[structure/synthetic-chat-support-bot/module-intent-classifier]]"
  - "[[structure/synthetic-chat-support-bot/module-session-store]]"
---

# API Gateway

ข้อความจากช่องทางแชทภายนอกเข้ามาทาง webhook ผ่าน API gateway กลาง ซึ่งแปลงเป็น รูปแบบข้อความมาตรฐานแล้วส่งต่อให้ [[structure/synthetic-chat-support-bot/module-intent-classifier]] คำขอที่ต้องการผลลัพธ์ทันที เช่น ดึงประวัติการสนทนา ใช้ synchronous call ผ่าน gateway ตัวนี้เหมือนกัน

สัญญาณ typing indicator และ presence (ลูกค้ากำลังพิมพ์อยู่) ไม่ผ่าน API gateway ตัวนี้ — ไปทาง WebSocket channel แยกต่างหากที่ [[structure/synthetic-chat-support-bot/module-session-store]] ควบคุมเอง เพราะสัญญาณพวกนี้ต้องอัปเดตแทบจะทันที latency ของ gateway กลาง (เฉลี่ย 80-150ms) ทำให้ typing indicator ดูค้างไม่เนียน
