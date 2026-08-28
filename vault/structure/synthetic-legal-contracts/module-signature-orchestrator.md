---
layer: structure
tags: [signature, module, core]
created: 2025-09-29
links:
  - "[[business-logic/synthetic-legal-contracts/signature-order-enforcement-policy]]"
  - "[[structure/synthetic-legal-contracts/module-obligation-tracker]]"
---

# Module: signature-orchestrator

ประสานงานลำดับการเซ็นสัญญาแบบอิเล็กทรอนิกส์ระหว่างคู่สัญญาหลายฝ่าย ไม่รู้จักเนื้อหาสัญญาเลย รู้แค่ว่าใครต้องเซ็นก่อนใคร เพื่อให้เปลี่ยน e-signature provider ในอนาคตได้โดยไม่กระทบ business logic ส่วนอื่นของระบบ

## ฟังก์ชันหลัก
- `initiateSignature(contractId: string, signers: SignerOrder[]): Promise<string>` — เริ่มกระบวนการเซ็น ส่งคำขอไปยังผู้เซ็นคนแรกตามลำดับ
- `recordSignature(requestId: string, signerId: string): Promise<void>` — บันทึกการเซ็นของคนหนึ่ง แล้วส่งคำขอไปยังคนถัดไปตามลำดับ
- `getSignatureStatus(contractId: string): Promise<SignatureStatus>` — คืนสถานะการเซ็นปัจจุบันของทุกฝ่าย

## State

not_started → step-by-step signed → fully_executed — ดู [[business-logic/synthetic-legal-contracts/signature-order-enforcement-policy]]

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่สัญญาเซ็นครบทุกฝ่าย publish event `contract.signed` ให้ [[structure/synthetic-legal-contracts/module-obligation-tracker]] เริ่มสร้าง obligation record อัตโนมัติจากเงื่อนไขในสัญญา
