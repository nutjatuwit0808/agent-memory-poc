---
layer: structure
tags: [audit-trail, module, core]
created: 2026-01-12
links:
  - "[[structure/synthetic-document-signing/queue-architecture]]"
---

# Module: audit-trail-logger

บันทึกทุกเหตุการณ์ที่เกิดกับ envelope แบบ append-only และ hash-chain (แต่ละ event เก็บ hash ของ event ก่อนหน้าไว้ด้วย) เพื่อพิสูจน์ได้ว่าไม่มีใครแก้ไข log ย้อนหลัง เป็นเอกสารหลักฐานที่ใช้อ้างอิงทางกฎหมายเมื่อเกิดข้อพิพาท

## ฟังก์ชันหลัก
- `appendEvent(envelopeId: string, eventType: AuditEventType, actorId: string, metadata: Record<string, unknown>): Promise<string>` — เพิ่ม event ใหม่ต่อท้าย chain คืน eventId
- `computeChainHash(envelopeId: string): Promise<string>` — คำนวณ hash ล่าสุดของ chain ทั้งหมดของ envelope นั้น
- `verifyChainIntegrity(envelopeId: string): Promise<boolean>` — ไล่ตรวจทุก event ใน chain ว่า hash ต่อเนื่องกันถูกต้องไม่มีจุดขาด

## ความสัมพันธ์กับ module อื่น

รับ event จากแทบทุก module ในระบบ (ดู [[structure/synthetic-document-signing/queue-architecture]]) แต่ไม่ publish event ของตัวเองกลับออกไปเลย — เพื่อไม่ให้กลายเป็นจุดที่ business logic อื่นมาพึ่งพาโดยไม่ตั้งใจ ความถูกต้องของ chain สำคัญกว่าความเร็ว จึงยอม `appendEvent` ช้ากว่า operation อื่นเพื่อรับประกัน ordering
