---
layer: structure
tags: [envelope, module, core]
created: 2025-10-07
links:
  - "[[business-logic/synthetic-document-signing/envelope-expiration-policy]]"
  - "[[structure/synthetic-document-signing/module-signature-capture]]"
---

# Module: envelope-builder

ประกอบเอกสาร + field ผู้เซ็น + ลำดับการเซ็นให้เป็น "envelope" หนึ่งชุดพร้อมส่งให้เซ็น แยกออกมาจาก "contract-service" ก้อนเดียวตั้งแต่ปลายปี 2024 เพราะ logic การจัดวาง field และลำดับผู้เซ็นซับซ้อนขึ้นเรื่อยๆ จนปนกับ logic การจัดการ template แล้วทดสอบยาก

## ฟังก์ชันหลัก
- `createEnvelope(templateId: string | null, signers: SignerInput[], documentRefs: string[]): Promise<string>` — สร้าง envelope ใหม่จาก template หรือเอกสารดิบ คืน envelopeId
- `addSignerField(envelopeId: string, signerId: string, fieldType: FieldType, page: number, position: Position): Promise<void>` — เพิ่ม field ที่ต้องกรอก/เซ็นให้ signer คนหนึ่งในตำแหน่งที่ระบุ
- `finalizeEnvelope(envelopeId: string): Promise<void>` — ล็อกโครงสร้าง envelope ไม่ให้แก้ field/signer ได้อีก แล้วเปลี่ยนสถานะเป็น `sent`

## State

draft → finalized → sent → completed | voided | expired — ดู [[business-logic/synthetic-document-signing/envelope-expiration-policy]] สำหรับเงื่อนไขว่าเมื่อไหร่ envelope หมดอายุ

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-document-signing/module-signature-capture]] โดยตรงตอนสร้าง — envelope-builder แค่กำหนดโครงสร้างและลำดับ ส่วนการบังคับใช้ลำดับจริงตอนเซ็นเป็นหน้าที่ของ [[structure/synthetic-document-signing/module-signature-capture]] ที่ query โครงสร้างนี้มาตรวจสอบเองทุกครั้ง เพื่อรักษาหลัก separation of concerns ระหว่าง "นิยาม" กับ "บังคับใช้"
