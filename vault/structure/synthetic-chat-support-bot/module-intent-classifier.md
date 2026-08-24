---
layer: structure
tags: [intent, module, core]
created: 2026-05-31
links:
  - "[[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]]"
  - "[[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]]"
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
---

# Module: intent-classifier

รับผิดชอบจำแนกว่าข้อความของลูกค้าต้องการอะไร (เช่น ถามสถานะ, ขอความช่วยเหลือ, ร้องเรียน) แยกออกมาจาก conversation-state-manager ตั้งแต่ต้นปี 2025 เพราะโมเดลจำแนก intent ต้อง iterate บ่อยและ deploy แยกรอบจาก logic การจัดการ state ที่เสถียรกว่ามาก

## ฟังก์ชันหลัก
- `classifyIntent(conversationId: string, message: string): Promise<IntentResult>` — จำแนก intent ของข้อความล่าสุด คืน label พร้อมค่า confidence
- `detectLanguage(message: string): Promise<LanguageCode>` — ตรวจภาษาของข้อความก่อนส่งเข้าโมเดลจำแนก intent ที่เหมาะกับภาษานั้น
- `reportLowConfidence(conversationId: string, intentResult: IntentResult): Promise<void>` — แจ้งผลจำแนกที่ confidence ต่ำกลับไปยัง conversation-state-manager พร้อมเหตุผล

## State

classifying → classified | low_confidence | unsupported_language — ดู [[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]] สำหรับเงื่อนไขว่าเมื่อไหร่ต้อง fallback

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]] โดยตรง — ถ้าจำแนก intent ได้แล้วจะ report ผลกลับไปที่ [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] แล้วปล่อยให้ conversation-state-manager เป็นคนตัดสินใจว่าจะเรียก knowledge-base-retriever ต่อหรือไม่ เพื่อรักษาหลัก separation of concerns
