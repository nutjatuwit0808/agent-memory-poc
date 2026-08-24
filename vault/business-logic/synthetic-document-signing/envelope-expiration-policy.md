---
layer: business-logic
tags: [envelope, expiration, policy]
created: 2025-12-08
links:
  - "[[structure/synthetic-document-signing/module-signature-capture]]"
  - "[[business-logic/synthetic-document-signing/envelope-expiration-policy-edge-cases]]"
---

# นโยบายวันหมดอายุของ Envelope

envelope หมดอายุอัตโนมัติเมื่อเกิน `DEFAULT_EXPIRATION_DAYS` (14 วัน) นับจากวันที่ finalize เว้นแต่ผู้สร้างจะระบุวันหมดอายุเองตอนสร้าง — เมื่อหมดอายุ signer ที่ยังไม่เซ็นจะไม่สามารถเซ็นได้อีกแม้จะมีลิงก์เดิมอยู่ก็ตาม

การหมดอายุตรวจสอบที่ชั้น [[structure/synthetic-document-signing/module-signature-capture]] ทุกครั้งก่อนอนุญาตให้เซ็น ไม่ใช่แค่การซ่อนลิงก์ที่ฝั่ง frontend เพราะลิงก์เก่าอาจถูก cache หรือ bookmark ไว้

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-document-signing/envelope-expiration-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
