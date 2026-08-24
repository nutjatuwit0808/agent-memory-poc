---
layer: structure
tags: [envelope, module, core, reference, identifiers]
created: 2026-02-08
links:
  - "[[structure/synthetic-document-signing/module-envelope-builder]]"
  - "[[business-logic/synthetic-document-signing/signing-order-policy]]"
---

# envelope-builder — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด envelope-builder สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-document-signing/module-envelope-builder]])

## Public functions
- `createEnvelope(templateId: string | null, signers: SignerInput[], documentRefs: string[]): Promise<string>` — สร้าง envelope ใหม่จาก template หรือเอกสารดิบ คืน envelopeId
- `addSignerField(envelopeId: string, signerId: string, fieldType: FieldType, page: number, position: Position): Promise<void>` — เพิ่ม field ที่ต้องกรอก/เซ็นให้ signer คนหนึ่งในตำแหน่งที่ระบุ
- `finalizeEnvelope(envelopeId: string): Promise<void>` — ล็อกโครงสร้าง envelope ไม่ให้แก้ field/signer ได้อีก แล้วเปลี่ยนสถานะเป็น `sent`

## Internal constants
- `MAX_SIGNERS_PER_ENVELOPE = 20`
- `MAX_FIELDS_PER_PAGE = 50`
- `DEFAULT_EXPIRATION_DAYS = 14`

## Type

```ts
interface Envelope {
  envelopeId: string;
  status: "draft" | "finalized" | "sent" | "completed" | "voided" | "expired";
  signingOrder: "sequential" | "parallel";
  createdAt: string;
  expiresAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่องลำดับการเซ็นที่ [[business-logic/synthetic-document-signing/signing-order-policy]]
