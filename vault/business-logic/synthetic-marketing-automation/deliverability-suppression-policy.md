---
layer: business-logic
tags: [deliverability, suppression, policy]
created: 2026-02-23
links:
  - "[[structure/synthetic-marketing-automation/module-deliverability-monitor]]"
  - "[[business-logic/synthetic-marketing-automation/deliverability-suppression-policy-edge-cases]]"
---

# นโยบายการ Suppress อัตโนมัติเมื่อ Deliverability ตก

[[structure/synthetic-marketing-automation/module-deliverability-monitor]] สั่ง `triggerSendPause` อัตโนมัติทันทีที่ bounce rate ของ batch ล่าสุดเกิน `BOUNCE_RATE_PAUSE_THRESHOLD_PCT` (ค่าปกติ 5%) โดยไม่ต้องรอการอนุมัติจากคน เพราะการส่งต่อไปขณะ bounce rate สูงจะยิ่งทำร้าย sender reputation ของทุก campaign ในอนาคต

การจะกลับมาส่งต่อหลัง pause ต้องมีคนตรวจสอบสาเหตุก่อนเสมอ (เช่น เป็นปัญหา segment ผิดหรือปัญหาที่ ESP) ระบบจะไม่ resume อัตโนมัติแม้ bounce rate ของ batch ถัดไปจะดูปกติแล้วก็ตาม

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-marketing-automation/deliverability-suppression-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
