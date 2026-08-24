---
layer: business-logic
tags: [creative, approval, policy]
created: 2026-08-18
links:
  - "[[structure/synthetic-ad-bidding/module-creative-renderer]]"
  - "[[business-logic/synthetic-ad-bidding/creative-approval-policy-edge-cases]]"
---

# นโยบายการอนุมัติ Creative

creative ทุกชิ้นต้องผ่านการอนุมัติ (ตรวจสอบเนื้อหา ขนาดไฟล์ ความปลอดภัยของ script ใน HTML5 banner) ก่อนที่ [[structure/synthetic-ad-bidding/module-creative-renderer]] จะเลือกมันมาแสดงผลได้ — `validateCreativeApproval` เช็คสถานะนี้ทุกครั้งก่อน render ไม่ cache ผลลัพธ์ไว้เกิน 5 นาที

creative ที่ยังไม่ผ่านอนุมัติจะไม่ถูกเลือกเป็น variant เลยแม้จะ match targeting ดีที่สุดก็ตาม — ระบบจะข้ามไปหา variant อื่นของแคมเปญเดียวกันที่ผ่านอนุมัติแล้วแทน

## ทำไมไม่ cache ผลอนุมัตินานกว่านี้

creative ที่เคยผ่านอนุมัติสามารถถูกเพิกถอนได้ภายหลัง (เช่น พบว่ามี script ที่พยายาม redirect ผู้ใช้ผิดปกติหลัง deploy ไปแล้ว) การ cache นานเกินไปจะทำให้ creative ที่ถูกเพิกถอนแล้วยังถูกแสดงผลต่อไปอีกหลายนาทีโดยไม่จำเป็น 5 นาทีคือจุดสมดุลระหว่าง latency กับความเสี่ยง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-ad-bidding/creative-approval-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
