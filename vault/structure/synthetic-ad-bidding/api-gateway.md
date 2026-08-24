---
layer: structure
tags: [ad-bidding, adpulse, gateway, api]
created: 2026-08-12
links:
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
  - "[[structure/synthetic-ad-bidding/module-win-notice-processor]]"
---

# API Gateway

bid request จาก SSP ภายนอกเข้ามาทาง HTTP endpoint กลางที่พูดภาษา OpenRTB 2.5 แปลง JSON เป็น internal bid object แล้วส่งต่อให้ [[structure/synthetic-ad-bidding/module-bid-request-handler]] คำขอที่ latency-critical ทั้งหมดของระบบอยู่ในเส้นทางนี้

win notice และ billing event ไม่ผ่าน gateway เดียวกับ bid request — แยกเป็น endpoint ต่างหากที่ [[structure/synthetic-ad-bidding/module-win-notice-processor]] รับเอง เพราะ traffic pattern ต่างกันมาก (bid request มาถี่มากแต่ latency-sensitive สุด ส่วน win notice มาน้อยกว่ามากแต่ไม่ต้องตอบ synchronous ทันที)
