---
layer: business-logic
tags: [document, stuck, policy]
created: 2026-03-28
links:
  - "[[business-logic/synthetic-hr-onboarding/document-signature-policy-edge-cases]]"
---

# นโยบายเอกสารเซ็นค้าง (Document Stuck)

เอกสารที่อยู่ในสถานะ `signed` (เซ็นแล้วที่ฝั่ง vendor) แต่ไม่มี webhook ยืนยัน `verified` เข้ามาภายใน `DOC_SIGNATURE_STUCK_THRESHOLD_HOURS` (ค่าปกติ 24 ชั่วโมง) จะถูก mark เป็น `stuck` โดยอัตโนมัติ

ระบบไม่ trigger การเซ็นใหม่อัตโนมัติเมื่อเจอ `stuck` — ต้องมีคนตรวจก่อนว่าเอกสารเซ็นจริงสำเร็จที่ฝั่ง vendor หรือไม่ เพื่อป้องกันการส่งคำขอเซ็นซ้ำให้พนักงานที่เซ็นไปแล้ว

## ความคล้ายกับปัญหา webhook อื่นในระบบ

รูปแบบนี้คล้ายกับเอกสารที่ค้างในหลายระบบที่พึ่งพา webhook จาก vendor ภายนอก — รากของปัญหาคือ webhook เป็น best-effort delivery ไม่มีการรับประกันว่าจะส่งถึงเสมอ ระบบจึงต้องมี timeout-based fallback แทนที่จะเชื่อ webhook อย่างเดียว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-hr-onboarding/document-signature-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
