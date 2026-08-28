---
layer: structure
tags: [offer, personalization, module]
created: 2025-09-06
links:
  - "[[structure/synthetic-loyalty-rewards/module-tier-calculator]]"
  - "[[business-logic/synthetic-loyalty-rewards/bonus-campaign-eligibility-policy]]"
---

# Module: offer-personalizer

สร้างและจัดการ offer พิเศษที่ปรับตามพฤติกรรมและ tier ของสมาชิกแต่ละคน ทำงานแบบ batch ทุก 24 ชั่วโมง ไม่ใช่ real-time เพราะการ compute offer ต้องการข้อมูลพฤติกรรมย้อนหลัง 90 วัน ซึ่งคิดใหม่ทุกชั่วโมงสิ้นเปลืองทรัพยากรโดยไม่จำเป็น

## ฟังก์ชันหลัก
- `generateMemberOffers(accountId: string): Promise<Offer[]>` — คำนวณ offer ชุดใหม่สำหรับสมาชิกตาม profile และ tier ปัจจุบัน
- `getActiveOffers(accountId: string): Promise<Offer[]>` — คืน offer ที่ยังไม่หมดอายุสำหรับสมาชิก
- `markOfferUsed(accountId: string, offerId: string): Promise<void>` — บันทึกว่า offer นี้ถูกใช้ไปแล้ว ป้องกันใช้ซ้ำ

## ความสัมพันธ์กับ module อื่น

subscribe `tier.upgraded` และ `tier.downgraded` จาก [[structure/synthetic-loyalty-rewards/module-tier-calculator]] เพื่อ invalidate offer cache และ regenerate ใหม่เมื่อ tier เปลี่ยน เนื่องจาก offer ขึ้นกับ tier โดยตรง — ดู [[business-logic/synthetic-loyalty-rewards/bonus-campaign-eligibility-policy]] สำหรับ rule การเข้าร่วม campaign พิเศษ
