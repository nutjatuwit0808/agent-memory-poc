---
layer: structure
tags: [signature, module, core, reference, identifiers]
created: 2026-06-11
links:
  - "[[structure/synthetic-legal-contracts/module-signature-orchestrator]]"
  - "[[business-logic/synthetic-legal-contracts/signature-order-enforcement-policy]]"
---

# signature-orchestrator — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด signature-orchestrator สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-legal-contracts/module-signature-orchestrator]])

## Public functions
- `initiateSignature(contractId: string, signers: SignerOrder[]): Promise<string>` — เริ่มกระบวนการเซ็น ส่งคำขอไปยังผู้เซ็นคนแรกตามลำดับ
- `recordSignature(requestId: string, signerId: string): Promise<void>` — บันทึกการเซ็นของคนหนึ่ง แล้วส่งคำขอไปยังคนถัดไปตามลำดับ
- `getSignatureStatus(contractId: string): Promise<SignatureStatus>` — คืนสถานะการเซ็นปัจจุบันของทุกฝ่าย

## Internal constants
- `SIGNATURE_REQUEST_EXPIRY_DAYS = 14`
- `SIGNATURE_REMINDER_INTERVAL_DAYS = 3`

## Type

```ts
interface SignatureStatus {
  contractId: string;
  currentStep: number;
  totalSteps: number;
  fullyExecuted: boolean;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องลำดับการเซ็นที่ [[business-logic/synthetic-legal-contracts/signature-order-enforcement-policy]]
