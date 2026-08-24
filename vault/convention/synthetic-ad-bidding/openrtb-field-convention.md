---
layer: convention
tags: [openrtb, schema]
created: 2026-04-22
links:
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
---

# OpenRTB Field Convention

เอกสารนี้กำหนดว่า field จาก OpenRTB request/response แต่ละตัว แปลงเป็น internal field ชื่ออะไร เพื่อไม่ให้แต่ละทีมแปลชื่อไม่ตรงกัน

## การแปลงชื่อ field หลัก

`imp[].bidfloor` → `floorPrice`, `imp[].id` → `impressionId`, `device.ifa` → `deviceId` ห้ามใช้ชื่อ OpenRTB ดิบในโค้ด internal เพื่อไม่ให้ผูกกับ spec เวอร์ชันใดเวอร์ชันหนึ่งแน่นเกินไป

## field ที่ต้องมีเสมอ

`requestId`, `campaignId` (หลังผ่าน auction แล้ว), `floorPrice` ต้องมีทุก internal bid object ที่ส่งต่อข้าม service — ขาดตัวใดตัวหนึ่ง [[structure/synthetic-ad-bidding/module-bid-request-handler]] จะปฏิเสธ pipeline ทันทีแทนที่จะเดาค่า default (เทียบกับหลักการเดียวกันที่ [[structure/synthetic-ad-bidding/module-auction-engine]] ใช้ตรวจ candidate)
