---
layer: business-logic
tags: [trial, policy]
created: 2026-07-11
links:
  - "[[business-logic/synthetic-subscription-billing/trial-length-extension-rules-policy-edge-cases]]"
---

# นโยบายระยะเวลาทดลองใช้และการขยายเวลา

ระยะเวลาทดลองใช้มาตรฐานคือ 14 วัน ขยายได้สูงสุดรวมไม่เกิน 30 วันต่อบัญชีหนึ่ง ไม่ว่าจะขยายกี่ครั้งก็ตาม เพื่อป้องกันการใช้ฟรีต่อเนื่องไม่มีกำหนด

การขยายเวลาต้องระบุเหตุผลเสมอผ่าน `extendTrial` และถูกบันทึกไว้สำหรับการวิเคราะห์ภายหลังว่าเหตุผลใดที่ทำให้ทีมขายต้องขยายเวลาบ่อย

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-subscription-billing/trial-length-extension-rules-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
