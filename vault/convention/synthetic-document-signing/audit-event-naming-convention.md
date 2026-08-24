---
layer: convention
tags: [audit-trail, naming]
created: 2026-08-13
links:
  - "[[structure/synthetic-document-signing/module-audit-trail-logger]]"
---

# Audit Event Naming Convention

event ทุกตัวที่ [[structure/synthetic-document-signing/module-audit-trail-logger]] บันทึกต้องตั้งชื่อตามกติกานี้ เพื่อให้ทีมกฎหมายและทีม support อ่าน audit trail ดิบได้โดยไม่ต้องเปิดเอกสารแยก

## รูปแบบชื่อ event

`snake_case` เสมอ ขึ้นต้นด้วย noun ตามด้วย verb ในรูปอดีต เช่น `envelope_sent`, `signer_completed`, `chain_gap_documented` — ห้ามใช้ชื่อกำกวมเช่น `updated` เฉยๆ โดยไม่ระบุว่าอะไรถูกอัปเดต

## Metadata ที่ต้องมี

ทุก event ต้องมี `actorId` เสมอแม้จะเป็น event ที่ระบบสร้างเอง (ใช้ `system` เป็นค่า actorId ในกรณีนั้น) เพื่อไม่ให้มี event ไหนที่ตอบไม่ได้ว่า "ใครเป็นคนทำ"
