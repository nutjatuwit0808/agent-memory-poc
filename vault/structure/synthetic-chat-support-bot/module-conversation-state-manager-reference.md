---
layer: structure
tags: [state, module, core, reference, identifiers]
created: 2026-07-19
links:
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
  - "[[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy]]"
---

# conversation-state-manager — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด conversation-state-manager สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-chat-support-bot/module-conversation-state-manager]])

## Public functions
- `appendTurn(conversationId: string, turn: ConversationTurn): Promise<void>` — บันทึกข้อความใหม่เข้าประวัติบทสนทนาและอัปเดตขั้นตอนปัจจุบัน
- `getConversationContext(conversationId: string, lastNTurns: number): Promise<ConversationTurn[]>` — ดึงประวัติล่าสุด N turn สำหรับ generate คำตอบหรือส่งต่อเจ้าหน้าที่
- `markConversationClosed(conversationId: string, reason: string): Promise<void>` — ปิดบทสนทนาเมื่อจบแล้ว ไม่ว่าจะจบด้วย bot หรือเจ้าหน้าที่
- `expireStaleConversation(conversationId: string): Promise<void>` — หมดอายุบทสนทนาที่ไม่มีข้อความใหม่นานเกิน threshold

## Internal constants
- `STALE_CONVERSATION_THRESHOLD_MIN = 30`
- `MAX_CONTEXT_TURNS_FOR_HANDOFF = 20`

## Type

```ts
interface ConversationTurn {
  conversationId: string;
  sender: "customer" | "bot" | "agent";
  text: string;
  timestamp: string;
  intentLabel?: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการหมดอายุบทสนทนาที่ [[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy]]
