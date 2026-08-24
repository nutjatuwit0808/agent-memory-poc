---
layer: structure
tags: [audit-trail, module, core, reference, identifiers]
created: 2026-06-07
links:
  - "[[structure/synthetic-document-signing/module-audit-trail-logger]]"
  - "[[business-logic/synthetic-document-signing/audit-trail-integrity-policy]]"
---

# audit-trail-logger — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด audit-trail-logger สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-document-signing/module-audit-trail-logger]])

## Public functions
- `appendEvent(envelopeId: string, eventType: AuditEventType, actorId: string, metadata: Record<string, unknown>): Promise<string>` — เพิ่ม event ใหม่ต่อท้าย chain คืน eventId
- `computeChainHash(envelopeId: string): Promise<string>` — คำนวณ hash ล่าสุดของ chain ทั้งหมดของ envelope นั้น
- `verifyChainIntegrity(envelopeId: string): Promise<boolean>` — ไล่ตรวจทุก event ใน chain ว่า hash ต่อเนื่องกันถูกต้องไม่มีจุดขาด

## Internal constants
- `HASH_ALGO = SHA-256`
- `CHAIN_VERIFY_BATCH_SIZE = 500`

## Type

```ts
interface AuditEvent {
  eventId: string;
  envelopeId: string;
  eventType: string;
  actorId: string;
  occurredAt: string;
  prevHash: string;
  hash: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องความสมบูรณ์ของ chain ที่ [[business-logic/synthetic-document-signing/audit-trail-integrity-policy]]
