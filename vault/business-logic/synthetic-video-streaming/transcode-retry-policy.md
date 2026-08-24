---
layer: business-logic
tags: [transcode, retry, policy]
created: 2026-02-14
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[business-logic/synthetic-video-streaming/transcode-retry-policy-edge-cases]]"
---

# นโยบายการ Retry เมื่อ Transcode ล้มเหลว

เมื่อ [[structure/synthetic-video-streaming/module-transcode-worker]] transcode ล้มเหลว ระบบจัดหมวดเป็น `failed_soft` (ลองใหม่ได้ เช่น worker ถูก preempt กลางงาน) หรือ `failed_hard` (ต้องให้คนช่วย เช่น codec ที่ต้นฉบับใช้ไม่รองรับเลย)

`failed_soft` จะถูก retry อัตโนมัติสูงสุด 2 ครั้งก่อนถูกยกระดับเป็น `failed_hard` โดยอัตโนมัติ เพื่อไม่ให้ job ค้างพยายาม transcode ไฟล์เดิมไม่จบไม่สิ้นในคิว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-video-streaming/transcode-retry-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
