---
layer: structure
tags: [template, module, core]
created: 2025-10-20
links:
  - "[[structure/synthetic-legal-contracts/module-clause-negotiator]]"
---

# Module: template-engine

จัดการ template สัญญาและ clause library ทั้งหมด รองรับการ versioning เพื่อให้ track ได้ว่าสัญญาแต่ละฉบับร่างจาก template เวอร์ชันไหน แยกออกมาเป็น service อิสระเพราะ clause library ต้องถูกดูแลโดยทีมกฎหมายส่วนกลาง ไม่ใช่ทีมที่ร่างสัญญารายวัน

## ฟังก์ชันหลัก
- `getTemplate(templateId: string, version?: string): Promise<ContractTemplate>` — ดึง template ตามเวอร์ชันที่ระบุ ถ้าไม่ระบุคืนเวอร์ชันล่าสุดที่ publish แล้ว
- `publishTemplate(templateId: string, clauses: ClauseRef[]): Promise<string>` — publish เวอร์ชันใหม่ของ template คืน versionId
- `instantiateContract(templateId: string, version: string): Promise<string>` — สร้างสัญญาฉบับใหม่จาก template เวอร์ชันที่ระบุ คืน contractId

## State

draft → published → deprecated — เวอร์ชันเก่าไม่ถูกลบทิ้งแม้ deprecated แล้ว เพื่อให้สัญญาเก่าที่อ้างอิงเวอร์ชันนั้นยังตรวจสอบย้อนหลังได้

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่ [[structure/synthetic-legal-contracts/module-clause-negotiator]] เริ่มสัญญาใหม่ ต้องเรียก `instantiateContract` ก่อนเสมอ ไม่มีทางสร้างสัญญาจากเนื้อหาว่างเปล่าได้ — บังคับให้ทุกสัญญามีจุดเริ่มต้นที่ตรวจสอบได้
