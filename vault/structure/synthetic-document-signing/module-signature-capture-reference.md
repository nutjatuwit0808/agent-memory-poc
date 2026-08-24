---
layer: structure
tags: [signature, module, core, reference, identifiers]
created: 2026-06-05
links:
  - "[[structure/synthetic-document-signing/module-signature-capture]]"
  - "[[business-logic/synthetic-document-signing/signing-order-policy]]"
---

# signature-capture — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด signature-capture สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-document-signing/module-signature-capture]])

## Public functions
- `recordSignature(envelopeId: string, signerId: string, signatureData: string, method: SignMethod): Promise<SignResult>` — บันทึกลายเซ็นจริงของ signer หลังผ่านการตรวจสอบลำดับแล้วเท่านั้น
- `validateSignerTurn(envelopeId: string, signerId: string): Promise<boolean>` — ตรวจว่า signer คนนี้ถึงตาเซ็นจริงตามลำดับที่กำหนดหรือไม่
- `lockFieldAfterSign(envelopeId: string, fieldId: string): Promise<void>` — ล็อก field ที่เซ็นแล้วไม่ให้แก้ไขได้อีก

## Internal constants
- `SIGNATURE_IMAGE_MAX_KB = 200`
- `TOUCH_SAMPLE_RATE_HZ = 60`
- `SIGN_TURN_CACHE_TTL_MS = 0`

## Type

```ts
interface SignResult {
  fieldId: string;
  signerId: string;
  signedAt: string;
  method: "drawn" | "typed" | "click_to_sign";
  auditEventId: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องลำดับการเซ็นที่ [[business-logic/synthetic-document-signing/signing-order-policy]]
