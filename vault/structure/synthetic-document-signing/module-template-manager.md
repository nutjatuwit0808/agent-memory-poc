---
layer: structure
tags: [template, module]
created: 2025-12-07
links:
  - "[[structure/synthetic-document-signing/module-envelope-builder]]"
  - "[[business-logic/synthetic-document-signing/template-merge-field-policy]]"
---

# Module: template-manager

จัดการเทมเพลตสัญญาที่ reuse ได้ พร้อม merge field (เช่น `{{customer_name}}`) ที่จะถูกแทนที่ด้วยค่าจริงตอนสร้าง envelope แต่ละเวอร์ชันของ template ถูก publish แยกจากกันเพื่อไม่ให้แก้ template กระทบ envelope ที่ส่งไปแล้วก่อนหน้า

## ฟังก์ชันหลัก
- `createTemplate(name: string, documentContent: string, mergeFields: string[]): Promise<string>` — สร้าง template ใหม่พร้อมระบุ merge field ที่ต้องกรอก
- `renderTemplate(templateId: string, mergeValues: Record<string, string>): Promise<string>` — แทนที่ merge field ด้วยค่าจริง คืนเนื้อหาเอกสารที่พร้อมส่งเข้า envelope-builder
- `publishTemplateVersion(templateId: string): Promise<number>` — ล็อก template เวอร์ชันปัจจุบัน คืนเลขเวอร์ชันใหม่

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-document-signing/module-envelope-builder]] เรียก `renderTemplate` ตอนสร้าง envelope จาก template แต่ template-manager ไม่รู้จัก concept ของ signer หรือลำดับการเซ็นเลย — รู้แค่เนื้อหาเอกสารกับ merge field เท่านั้น merge field ที่ไม่ถูกกรอกจัดการตาม [[business-logic/synthetic-document-signing/template-merge-field-policy]]
