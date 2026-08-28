---
layer: business-logic
tags: [signature, security, policy]
created: 2025-10-30
links:
  - "[[business-logic/synthetic-legal-contracts/counterparty-verification-policy-edge-cases]]"
---

# นโยบายการยืนยันตัวตนคู่สัญญา

ก่อนเริ่มกระบวนการเซ็นกับคู่สัญญาภายนอก ต้องยืนยันตัวตนและสถานะทางกฎหมายของคู่สัญญาก่อนเสมอ (เช่น ตรวจสอบสถานะนิติบุคคลว่ายังดำเนินกิจการอยู่จริง) ไม่ส่งคำขอเซ็นให้คู่สัญญาที่ยังไม่ผ่านการยืนยัน

ผลการยืนยันตัวตนมีอายุ 90 วัน — ถ้าสัญญาใช้เวลาเจรจานานกว่านั้น ต้องยืนยันตัวตนคู่สัญญาใหม่ก่อนเริ่มกระบวนการเซ็นจริง แม้จะเคยยืนยันผ่านไปแล้วตอนเริ่มเจรจาก็ตาม

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-legal-contracts/counterparty-verification-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
