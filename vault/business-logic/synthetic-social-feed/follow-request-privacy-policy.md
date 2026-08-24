---
layer: business-logic
tags: [follow, privacy, policy]
created: 2026-07-10
links:
  - "[[business-logic/synthetic-social-feed/follow-request-privacy-policy-edge-cases]]"
---

# นโยบายการอนุมัติคำขอ Follow บัญชี Private

คำขอ follow บัญชี private ต้องรอเจ้าของบัญชีอนุมัติด้วยมือเสมอ ไม่มีการอนุมัติอัตโนมัติไม่ว่ากรณีใด ต่างจากบัญชี public ที่ follow สำเร็จทันที

คำขอที่ไม่ได้รับการตอบสนองภายใน `PRIVATE_ACCOUNT_APPROVAL_TIMEOUT_HOURS` ชั่วโมงจะหมดอายุอัตโนมัติ ผู้ขอต้องส่งคำขอใหม่ถ้ายังสนใจ ไม่ค้างอยู่ในสถานะ pending ตลอดไป

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-social-feed/follow-request-privacy-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
