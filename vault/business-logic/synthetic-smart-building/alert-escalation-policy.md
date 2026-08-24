---
layer: business-logic
tags: [alerting, escalation, policy]
created: 2025-12-27
links:
  - "[[business-logic/synthetic-smart-building/alert-escalation-policy-edge-cases]]"
---

# นโยบายการยกระดับ Alert ที่ไม่มีคน Acknowledge

alert ระดับ `critical` ที่ไม่มีคน acknowledge ภายใน 5 นาทีจะถูก escalate ไปหา on-call คนถัดไปในสายอัตโนมัติผ่าน `escalateAlert` ระดับ `warning` มีเวลาก่อน escalate นานกว่าคือ 30 นาที

ในช่วงเวลานอกเวลาทำการ (22:00-06:00) alert ระดับ `warning` จะถูกรวมเป็น digest ส่งตอนเช้าแทนการ page ทันที ยกเว้น `critical` ที่ page ทันทีตลอด 24 ชั่วโมงไม่มีข้อยกเว้นเรื่องเวลา

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-smart-building/alert-escalation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
