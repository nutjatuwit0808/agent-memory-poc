---
layer: business-logic
tags: [billing, dedup, policy]
created: 2025-12-24
links:
  - "[[structure/synthetic-ad-bidding/module-win-notice-processor]]"
  - "[[business-logic/synthetic-ad-bidding/win-notice-dedup-policy-edge-cases]]"
---

# นโยบายกัน Win Notice ซ้ำ

[[structure/synthetic-ad-bidding/module-win-notice-processor]] deduplicate win notice ด้วย `noticeId` ที่ SSP ส่งมาคู่กับทุก notice — ถ้า noticeId ซ้ำกับที่เคยประมวลผลไปแล้วภายใน 24 ชั่วโมงล่าสุด จะไม่หักเงินซ้ำเด็ดขาด

SSP บางรายส่ง win notice ซ้ำโดยตั้งใจเป็นกลไก retry ของเขาเอง (ถ้าไม่ได้รับ ack กลับไปในเวลาที่กำหนด) ระบบจึงต้องตอบ ack ให้ SSP เร็วที่สุดแม้จะเป็น notice ที่ deduplicate ทิ้งไปแล้วก็ตาม เพื่อหยุด retry loop ฝั่งเขา

## ทำไม dedup window เป็น 24 ชั่วโมงไม่ใช่ตลอดไป

การเก็บ noticeId ไว้ตรวจสอบตลอดไปจะทำให้ตารางโตไม่จำกัด และในทางปฏิบัติ SSP ไม่เคย retry ข้ามวันจริง — 24 ชั่วโมงคือ margin ที่กว้างพอสำหรับ retry ทุกกรณีที่เคยเจอจริง พร้อมจำกัดขนาดตารางให้จัดการได้

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-ad-bidding/win-notice-dedup-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
