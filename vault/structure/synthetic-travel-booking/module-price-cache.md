---
layer: structure
tags: [pricing, cache, module]
created: 2026-04-02
links:
  - "[[structure/synthetic-travel-booking/module-availability-search]]"
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
  - "[[business-logic/synthetic-travel-booking/price-cache-staleness-policy]]"
---

# Module: price-cache

cache ราคาล่าสุดที่ query มาจากซัพพลายเออร์ไว้ใน in-memory store เพื่อให้ [[structure/synthetic-travel-booking/module-availability-search]] ตอบเร็วโดยไม่ต้องยิงหาซัพพลายเออร์ทุก request แยกออกจาก inventory snapshot ของ [[structure/synthetic-travel-booking/module-supplier-sync]] โดยเจตนา เพราะราคาผันผวนบ่อยกว่าห้องว่างมาก

## ฟังก์ชันหลัก
- `getCachedPrice(offerId: string): Promise<CachedPrice | null>` — คืนราคาที่ cache ไว้ถ้ายังไม่หมดอายุ
- `invalidate(offerId: string): Promise<void>` — ล้าง entry เดี่ยวเมื่อรู้ว่าราคาเปลี่ยนแล้ว
- `warmCache(supplierId: string): Promise<void>` — ดึงราคาชุดใหญ่จากซัพพลายเออร์มาเติม cache ล่วงหน้าตอน off-peak

## ความสัมพันธ์กับ module อื่น

subscribe event `inventory.sync_completed` จาก [[structure/synthetic-travel-booking/module-supplier-sync]] เพื่อรู้ว่าเมื่อไหร่ควร invalidate — แต่ไม่ได้รับประกันว่าราคาที่ cache ไว้จะตรงกับความจริงเสมอ ดูเงื่อนไขยอมรับความคลาดเคลื่อนที่ [[business-logic/synthetic-travel-booking/price-cache-staleness-policy]]
