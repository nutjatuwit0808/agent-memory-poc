---
layer: business-logic
tags: [bidding, timeout, policy]
created: 2026-02-02
links:
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
  - "[[business-logic/synthetic-ad-bidding/bid-timeout-policy-edge-cases]]"
---

# นโยบาย Time Budget และ Timeout ของ Bid Request

SSP ส่วนใหญ่กำหนด timeout รวมไม่เกิน 100ms ต่อ bid request — ถ้า AdPulse ตอบช้ากว่านั้น SSP จะตัดการเชื่อมต่อและถือว่าเป็น no-bid โดยอัตโนมัติ [[structure/synthetic-ad-bidding/module-bid-request-handler]] จึงต้องแบ่งเวลาที่มีให้แต่ละ downstream call อย่างเคร่งครัดผ่าน `allocateTimeBudget`

ค่า default: fraud check 15ms, internal auction 25ms, creative selection 20ms เหลือ buffer ~20ms สำหรับ network overhead และ serialization ก่อนตอบกลับ — ตัวเลขนี้ตั้งจาก p99 latency จริงของแต่ละ service ไม่ใช่ตัวเลขที่เดาขึ้นมาลอยๆ

## ทำไม timeout ภายในต้องเข้มกว่าที่ SSP กำหนดจริง

ถ้าตั้ง timeout ภายในให้เท่ากับ deadline ของ SSP พอดี จะไม่เหลือ margin สำหรับความแปรปรวนของ network ระหว่าง data center ของ AdPulse กับ SSP เลย — ทีมตั้งกฎว่า internal deadline ต้องน้อยกว่า SSP deadline อย่างน้อย 15% เสมอ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-ad-bidding/bid-timeout-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
