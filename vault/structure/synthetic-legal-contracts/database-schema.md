---
layer: structure
tags: [legal-contracts, lexdraft, database, schema]
created: 2026-07-10
links:
  - "[[structure/synthetic-legal-contracts/module-template-engine]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-legal-contracts/module-template-engine]] ดูแล ได้แก่ `contract_templates`, `clause_library` (versioned), และ `template_clause_mapping`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `contract_templates` | template-engine | versioned เก็บทุกเวอร์ชันที่เคย publish |
| `contracts` | clause-negotiator | เก็บ snapshot เนื้อหาสัญญาแต่ละฉบับ ไม่ผูก FK ตรงไป template |
| `signature_requests` | signature-orchestrator | ไม่มีเนื้อหาสัญญา เก็บแค่ metadata การเซ็น |
| `obligations` | obligation-tracker | ผูกกับ contractId แบบ soft reference |

ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — เช็คความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก signature_request มี contractId ที่มีอยู่จริง)
