---
layer: business-logic
tags: [signing-order, policy]
created: 2026-02-07
links:
  - "[[business-logic/synthetic-document-signing/signing-order-policy-edge-cases]]"
---

# นโยบายลำดับการเซ็นเอกสาร (Signing Order)

envelope ที่ตั้งค่า `signingOrder = "sequential"` บังคับให้ signer เซ็นตามลำดับที่กำหนดเท่านั้น — signer ลำดับถัดไปจะไม่สามารถเซ็นได้จนกว่า signer ก่อนหน้าจะเซ็นเสร็จ ตรวจสอบผ่าน `validateSignerTurn` ทุกครั้งก่อนอนุญาต `recordSignature`

envelope ที่ตั้งค่า `signingOrder = "parallel"` ให้ signer ทุกคนเซ็นเมื่อไหร่ก็ได้โดยไม่ต้องรอกัน เหมาะกับกรณีที่ผู้เซ็นแต่ละคนไม่มีความสัมพันธ์เชิงอนุมัติต่อกัน

## ทำไมต้องบังคับลำดับที่ชั้น service ไม่ใช่แค่ UI

ถ้าบังคับแค่ระดับ UI (เช่น ซ่อนปุ่มเซ็นของคนที่ยังไม่ถึงตา) ผู้ใช้ที่เรียก API ตรงหรือใช้ integration ภายนอกจะข้ามลำดับได้ การบังคับที่ `validateSignerTurn` ในชั้น service ทำให้ไม่มีทางลัดใดๆ เข้าถึงได้เลยไม่ว่าจะผ่านช่องทางไหน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-document-signing/signing-order-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
