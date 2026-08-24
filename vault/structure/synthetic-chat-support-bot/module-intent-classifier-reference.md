---
layer: structure
tags: [intent, module, core, reference, identifiers]
created: 2026-02-26
links:
  - "[[structure/synthetic-chat-support-bot/module-intent-classifier]]"
  - "[[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]]"
---

# intent-classifier — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด intent-classifier สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-chat-support-bot/module-intent-classifier]])

## Public functions
- `classifyIntent(conversationId: string, message: string): Promise<IntentResult>` — จำแนก intent ของข้อความล่าสุด คืน label พร้อมค่า confidence
- `detectLanguage(message: string): Promise<LanguageCode>` — ตรวจภาษาของข้อความก่อนส่งเข้าโมเดลจำแนก intent ที่เหมาะกับภาษานั้น
- `reportLowConfidence(conversationId: string, intentResult: IntentResult): Promise<void>` — แจ้งผลจำแนกที่ confidence ต่ำกลับไปยัง conversation-state-manager พร้อมเหตุผล

## Internal constants
- `INTENT_CONFIDENCE_MIN_THRESHOLD = 0.72`
- `CLASSIFY_TIMEOUT_MS = 800`
- `SUPPORTED_LANGUAGE_CODES = ["th", "en", "zh"]`

## Type

```ts
interface IntentResult {
  conversationId: string;
  label: string;
  confidence: number;
  language: string;
  fallbackReason?: "low_confidence" | "unsupported_language";
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]]
