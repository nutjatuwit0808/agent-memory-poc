---
layer: structure
tags: [document-signing, signflow, database, schema]
created: 2026-01-31
links:
  - "[[structure/synthetic-document-signing/module-envelope-builder]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-document-signing/module-envelope-builder]] ดูแล ได้แก่ `envelopes` (metadata และสถานะ), `envelope_signers` (ลำดับและสถานะผู้เซ็นแต่ละคน), และ `envelope_fields` (ตำแหน่ง field ทุกช่องในเอกสาร)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `envelopes` | envelope-builder | สถานะรวมของ envelope |
| `audit_events` | audit-trail-logger | log แบบ append-only มี hash chain |
| `templates` | template-manager | เทมเพลตสัญญาที่ reuse ได้ พร้อม merge field |
| `notary_sessions` | notary-integration | สถานะการรับรองเอกสารกับผู้ให้บริการภายนอก |

ทุกตารางใช้ `envelope_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) `audit_events` ห้าม UPDATE หรือ DELETE เด็ดขาดในระดับ database permission ไม่ใช่แค่ application logic เพื่อรักษาความน่าเชื่อถือของ hash chain
