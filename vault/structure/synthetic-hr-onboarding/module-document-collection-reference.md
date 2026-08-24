---
layer: structure
tags: [document, module, core, reference, identifiers]
created: 2025-10-05
links:
  - "[[structure/synthetic-hr-onboarding/module-document-collection]]"
  - "[[business-logic/synthetic-hr-onboarding/document-signature-policy]]"
---

# document-collection — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด document-collection สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-hr-onboarding/module-document-collection]])

## Public functions
- `requestSignature(hireId: string, documentType: DocumentType): Promise<SignatureRequest>` — สร้างคำขอเซ็นเอกสารส่งไป e-signature vendor คืน request พร้อม tracking id
- `handleSignatureWebhook(payload: SignatureWebhookPayload): Promise<void>` — รับ webhook ยืนยันจาก vendor แล้วอัปเดตสถานะเอกสาร
- `getDocumentStatus(hireId: string, documentType: DocumentType): Promise<DocumentStatus>` — คืนสถานะเอกสารปัจจุบัน ใช้เช็คก่อนขยับ onboarding stage

## Internal constants
- `SIGNATURE_REQUEST_TTL_HOURS = 72`
- `DOC_SIGNATURE_STUCK_THRESHOLD_HOURS = 24`

## Type

```ts
interface DocumentRecord {
  hireId: string;
  documentType: "tax_form" | "employment_contract" | "nda";
  status: "sent" | "viewed" | "signed" | "verified" | "expired" | "stuck";
  vendorRequestId: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเอกสารค้างที่ [[business-logic/synthetic-hr-onboarding/document-signature-policy]]
