---
layer: structure
tags: [document, module, core]
created: 2026-01-06
links:
  - "[[business-logic/synthetic-hr-onboarding/document-signature-policy]]"
  - "[[structure/synthetic-hr-onboarding/module-task-assignment]]"
---

# Module: document-collection

จัดการเอกสารที่ต้องเซ็นก่อนเริ่มงาน (สัญญาจ้าง, แบบฟอร์มภาษี, NDA) ผ่าน e-signature vendor ภายนอก รับ webhook ยืนยันการเซ็นกลับมา เป็นจุดที่มี pattern คล้าย payment webhook ของฝั่ง PayFlow — คือถ้า webhook หายกลางทาง เอกสารจะค้างสถานะ `pending` ทั้งที่เซ็นจริงเสร็จแล้วที่ฝั่ง vendor

## ฟังก์ชันหลัก
- `requestSignature(hireId: string, documentType: DocumentType): Promise<SignatureRequest>` — สร้างคำขอเซ็นเอกสารส่งไป e-signature vendor คืน request พร้อม tracking id
- `handleSignatureWebhook(payload: SignatureWebhookPayload): Promise<void>` — รับ webhook ยืนยันจาก vendor แล้วอัปเดตสถานะเอกสาร
- `getDocumentStatus(hireId: string, documentType: DocumentType): Promise<DocumentStatus>` — คืนสถานะเอกสารปัจจุบัน ใช้เช็คก่อนขยับ onboarding stage

## State

sent → viewed → signed → verified หรือ expired — ถ้าค้างที่ `signed` นานเกิน `DOC_SIGNATURE_STUCK_THRESHOLD_HOURS` โดยไม่มี webhook ยืนยัน `verified` เข้ามา จะถูก mark เป็น `stuck` ดู [[business-logic/synthetic-hr-onboarding/document-signature-policy]]

## ความสัมพันธ์กับ module อื่น

ไม่แตะสถานะ task โดยตรง — ปล่อยให้ [[structure/synthetic-hr-onboarding/module-task-assignment]] ฟัง event `document.signed` เองแล้วอัปเดต task ที่เกี่ยวข้อง เพื่อรักษาหลัก "แต่ละ service เป็นเจ้าของ data ตัวเอง"
