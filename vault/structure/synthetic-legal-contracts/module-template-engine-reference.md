---
layer: structure
tags: [template, module, core, reference, identifiers]
created: 2026-08-03
links:
  - "[[structure/synthetic-legal-contracts/module-template-engine]]"
  - "[[business-logic/synthetic-legal-contracts/mandatory-clause-set-policy]]"
---

# template-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด template-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-legal-contracts/module-template-engine]])

## Public functions
- `getTemplate(templateId: string, version?: string): Promise<ContractTemplate>` — ดึง template ตามเวอร์ชันที่ระบุ ถ้าไม่ระบุคืนเวอร์ชันล่าสุดที่ publish แล้ว
- `publishTemplate(templateId: string, clauses: ClauseRef[]): Promise<string>` — publish เวอร์ชันใหม่ของ template คืน versionId
- `instantiateContract(templateId: string, version: string): Promise<string>` — สร้างสัญญาฉบับใหม่จาก template เวอร์ชันที่ระบุ คืน contractId

## Internal constants
- `TEMPLATE_VERSION_RETENTION_YEARS = 10`
- `MAX_CLAUSE_PER_TEMPLATE = 80`

## Type

```ts
interface ContractTemplate {
  templateId: string;
  version: string;
  clauses: ClauseRef[];
  status: "draft" | "published" | "deprecated";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง clause บังคับที่ [[business-logic/synthetic-legal-contracts/mandatory-clause-set-policy]]
