---
layer: structure
tags: [state, module, core]
created: 2026-02-02
links:
  - "[[structure/synthetic-chat-support-bot/module-handoff-router]]"
---

# Module: conversation-state-manager

เจ้าของ state ของทุกบทสนทนา (ขั้นตอนปัจจุบัน, ประวัติ turn ล่าสุด, ว่าอยู่ระหว่างรอ bot หรือรอเจ้าหน้าที่) ทุก service อื่นที่ต้องรู้ว่าบทสนทนาไหนอยู่สถานะไหนต้อง query ผ่านตัวนี้เท่านั้น ไม่มี service ไหนเก็บ state การสนทนาซ้ำเอง

## ฟังก์ชันหลัก
- `appendTurn(conversationId: string, turn: ConversationTurn): Promise<void>` — บันทึกข้อความใหม่เข้าประวัติบทสนทนาและอัปเดตขั้นตอนปัจจุบัน
- `getConversationContext(conversationId: string, lastNTurns: number): Promise<ConversationTurn[]>` — ดึงประวัติล่าสุด N turn สำหรับ generate คำตอบหรือส่งต่อเจ้าหน้าที่
- `markConversationClosed(conversationId: string, reason: string): Promise<void>` — ปิดบทสนทนาเมื่อจบแล้ว ไม่ว่าจะจบด้วย bot หรือเจ้าหน้าที่
- `expireStaleConversation(conversationId: string): Promise<void>` — หมดอายุบทสนทนาที่ไม่มีข้อความใหม่นานเกิน threshold

## State

active_bot → active_human | resolved | expired (จาก active_bot ก็ได้ถ้ามี handoff) หรือ active_human → resolved | expired

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-chat-support-bot/module-handoff-router]] เรียก `getConversationContext` ทุกครั้งก่อนส่งต่อเจ้าหน้าที่ แต่ conversation-state-manager ไม่รู้จัก concept ของ "เจ้าหน้าที่คนไหนว่าง" เลย — รู้แค่ว่าบทสนทนาไหนกำลังรออะไรอยู่ การตัดสินใจจับคู่เจ้าหน้าที่ทั้งหมดอยู่ที่ handoff-router
