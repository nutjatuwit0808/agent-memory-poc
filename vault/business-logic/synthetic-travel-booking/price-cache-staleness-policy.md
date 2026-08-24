---
layer: business-logic
tags: [pricing, cache, policy]
created: 2026-03-30
links:
  - "[[structure/synthetic-travel-booking/module-price-cache]]"
  - "[[business-logic/synthetic-travel-booking/price-cache-staleness-policy-edge-cases]]"
---

# นโยบายการยอมรับความล้าสมัยของ Price Cache

ราคาใน [[structure/synthetic-travel-booking/module-price-cache]] มีอายุปกติ `PRICE_CACHE_TTL_SEC` (5 นาที) ก่อนถือว่า stale ระบบยอมให้แสดงราคา stale ในหน้าค้นหาได้อีก `PRICE_CACHE_STALE_GRACE_SEC` (2 นาที) เพื่อลด load การเรียกซัพพลายเออร์ซ้ำถี่เกินไป

การยอมรับ staleness นี้ใช้ได้เฉพาะหน้าค้นหาเท่านั้น — ตอนจะยืนยันการจองจริงต้องเช็คราคาสดเสมอ ไม่มีข้อยกเว้น เพื่อไม่ให้ผู้ใช้ถูกเรียกเก็บเงินผิดจากราคาที่เห็นตอนค้นหา

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-travel-booking/price-cache-staleness-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
