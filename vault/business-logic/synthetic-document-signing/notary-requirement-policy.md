---
layer: business-logic
tags: [notary, policy]
created: 2026-07-15
links:
  - "[[structure/synthetic-document-signing/module-notary-integration]]"
  - "[[business-logic/synthetic-document-signing/notary-requirement-policy-edge-cases]]"
---

# นโยบายการกำหนดเอกสารที่ต้องผ่าน Notary

เอกสารที่ถูก flag เป็นประเภท `notarization_required` ตอนสร้าง template (เช่น เอกสารโอนกรรมสิทธิ์บางประเภท) ต้องผ่าน [[structure/synthetic-document-signing/module-notary-integration]] ก่อนถึงจะเปลี่ยนสถานะเป็น `completed` ได้ แม้ signer ทุกคนจะเซ็นครบแล้วก็ตาม

envelope ที่ต้องผ่าน notary จะมี state พิเศษ `pending_notarization` คั่นระหว่าง "เซ็นครบแล้ว" กับ "completed จริง" เพื่อสื่อสารให้ทุกฝ่ายเห็นชัดว่ายังไม่จบกระบวนการ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-document-signing/notary-requirement-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
