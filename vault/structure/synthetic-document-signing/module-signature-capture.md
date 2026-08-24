---
layer: structure
tags: [signature, module, core]
created: 2026-01-14
links:
  - "[[structure/synthetic-document-signing/module-audit-trail-logger]]"
  - "[[structure/synthetic-document-signing/service-boundaries]]"
  - "[[business-logic/synthetic-document-signing/signing-order-policy]]"
---

# Module: signature-capture

จับลายเซ็นจริง (วาดด้วยนิ้ว/เมาส์, พิมพ์ชื่อ, หรือ click-to-sign) และเป็นจุดเดียวที่ตรวจสอบว่าถึงตา signer คนนี้เซ็นจริงหรือยังก่อนอนุญาตให้ดำเนินการต่อ ทุกการเซ็นต้องผ่าน module นี้เท่านั้น ไม่มีทางลัดจาก UI ไหนเขียนสถานะเซ็นตรงๆ

## ฟังก์ชันหลัก
- `recordSignature(envelopeId: string, signerId: string, signatureData: string, method: SignMethod): Promise<SignResult>` — บันทึกลายเซ็นจริงของ signer หลังผ่านการตรวจสอบลำดับแล้วเท่านั้น
- `validateSignerTurn(envelopeId: string, signerId: string): Promise<boolean>` — ตรวจว่า signer คนนี้ถึงตาเซ็นจริงตามลำดับที่กำหนดหรือไม่
- `lockFieldAfterSign(envelopeId: string, fieldId: string): Promise<void>` — ล็อก field ที่เซ็นแล้วไม่ให้แก้ไขได้อีก

## State

pending → signed | declined — ต่อ signer หนึ่งคนต่อหนึ่ง field ที่ต้องเซ็น

## ความสัมพันธ์กับ module อื่น

เรียก [[structure/synthetic-document-signing/module-audit-trail-logger]] ทุกครั้งที่มีการเซ็นสำเร็จภายใน transaction เดียวกับการเขียนสถานะ (ดู [[structure/synthetic-document-signing/service-boundaries]]) — `validateSignerTurn` คือจุดบังคับใช้จริงของ [[business-logic/synthetic-document-signing/signing-order-policy]] ทั้งหมด ถ้าจุดนี้มี bug ลำดับการเซ็นทั้งระบบก็พังทันที
