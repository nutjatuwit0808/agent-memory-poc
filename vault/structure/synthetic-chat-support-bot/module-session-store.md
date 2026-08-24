---
layer: structure
tags: [session, module]
created: 2026-02-18
links:
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
  - "[[structure/synthetic-chat-support-bot/api-gateway]]"
---

# Module: session-store

จัดการ session ของลูกค้าที่เชื่อมต่ออยู่ผ่าน WebSocket รวมถึงสัญญาณ presence และ typing indicator แยกออกมาเป็น service อิสระเพราะการรักษา connection แบบ real-time มีลักษณะการ scale และ failure mode ต่างจาก service อื่นที่เป็น request-response ทั่วไป

## ฟังก์ชันหลัก
- `openSession(conversationId: string, channel: ChannelType): Promise<SessionHandle>` — เปิด session WebSocket ใหม่เมื่อลูกค้าเริ่มแชท
- `broadcastTyping(conversationId: string, who: "bot" | "agent"): Promise<void>` — ส่งสัญญาณ typing indicator ให้ลูกค้าเห็นแบบ real-time
- `closeSession(sessionId: string, reason: string): Promise<void>` — ปิด session เมื่อลูกค้าตัดการเชื่อมต่อหรือบทสนทนาจบ

## ความสัมพันธ์กับ module อื่น

ไม่เก็บประวัติข้อความเอง — แค่ transport layer ที่ forward ข้อความเข้า-ออกระหว่างลูกค้ากับ [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] เท่านั้น ดู [[structure/synthetic-chat-support-bot/api-gateway]] สำหรับเหตุผลที่ WebSocket channel นี้ไม่ผ่าน API gateway กลาง
