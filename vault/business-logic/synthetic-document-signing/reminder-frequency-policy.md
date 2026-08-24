---
layer: business-logic
tags: [reminder, policy]
created: 2025-10-03
links:
  - "[[business-logic/synthetic-document-signing/reminder-frequency-policy-edge-cases]]"
---

# นโยบายความถี่การแจ้งเตือนผู้เซ็น

signer ที่ยังไม่เซ็นจะได้รับเตือนทุก 2 วันหลังถึงตาเซ็น สูงสุด 3 ครั้งก่อนที่ระบบจะหยุดเตือนอัตโนมัติและแจ้งผู้สร้าง envelope ให้ตามด้วยตัวเองแทน เพื่อไม่ให้กลายเป็นสแปมสำหรับ signer ที่ตั้งใจไม่เซ็น

เตือนทุกฉบับต้องถูกยกเลิกทันทีที่ signer เซ็นเสร็จผ่าน event `signer.completed` — นี่คือกลไกป้องกันหลักไม่ให้ signer ที่เซ็นแล้วยังได้รับเตือนซ้ำ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-document-signing/reminder-frequency-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
