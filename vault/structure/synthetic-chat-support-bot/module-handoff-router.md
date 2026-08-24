---
layer: structure
tags: [handoff, module]
created: 2026-01-04
links:
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
  - "[[structure/synthetic-chat-support-bot/service-boundaries]]"
  - "[[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]]"
---

# Module: handoff-router

ตัดสินใจว่าเมื่อไหร่ต้องส่งบทสนทนาต่อให้เจ้าหน้าที่คน และจับคู่กับเจ้าหน้าที่ที่เหมาะสม เป็น service เดียวที่ query ข้าม [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] และคิวเจ้าหน้าที่พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู [[structure/synthetic-chat-support-bot/service-boundaries]])

## ฟังก์ชันหลัก
- `requestHandoff(conversationId: string, reason: HandoffReason): Promise<QueuePosition>` — ยื่นคำขอส่งต่อเจ้าหน้าที่ พร้อมเหตุผล คืนตำแหน่งในคิวปัจจุบัน
- `assignAgent(conversationId: string): Promise<AgentAssignment | null>` — จับคู่บทสนทนาที่รอนานที่สุดกับเจ้าหน้าที่ที่ว่างและเหมาะกับหมวดปัญหาที่สุด
- `requeueOnAgentDisconnect(conversationId: string): Promise<void>` — ดันบทสนทนากลับเข้าคิวเมื่อเจ้าหน้าที่หลุดการเชื่อมต่อกลางคัน

## State

queued → assigned → in_progress → resolved | requeued | abandoned

## ความสัมพันธ์กับ module อื่น

ถ้าบทสนทนาอยู่ใน `queued` นานเกิน threshold โดยไม่มีเจ้าหน้าที่รับ ระบบจะแจ้งเตือนหัวหน้าทีม — นี่คือปัญหาที่ทำให้เกิด incident จำนวนมากช่วง peak support window ดู [[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]]
