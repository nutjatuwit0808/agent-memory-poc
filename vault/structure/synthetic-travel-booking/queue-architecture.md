---
layer: structure
tags: [travel-booking, tripledger, queue, async]
created: 2026-08-05
links:
  - "[[structure/synthetic-travel-booking/module-itinerary-builder]]"
  - "[[structure/synthetic-travel-booking/module-booking-engine]]"
  - "[[structure/synthetic-travel-booking/module-price-cache]]"
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `booking.hold_created`, `booking.confirmed`, `booking.cancelled`, `inventory.sync_completed`, `price.invalidated` — [[structure/synthetic-travel-booking/module-itinerary-builder]] subscribe `booking.confirmed` เพื่อประกอบทริปโดยไม่ต้อง poll [[structure/synthetic-travel-booking/module-booking-engine]] เอง

[[structure/synthetic-travel-booking/module-price-cache]] subscribe `inventory.sync_completed` จาก [[structure/synthetic-travel-booking/module-supplier-sync]] เพื่อรู้ว่าเมื่อไหร่ควร invalidate ราคาที่ cache ไว้ — การแยก event สองเส้นนี้ (sync inventory คนละเส้นกับ invalidate price) คือจุดที่ทีมมองย้อนกลับไปว่าน่าจะเป็นต้นตอของปัญหา staleness หลายครั้ง เพราะ event หายหรือมาช้าได้โดยอีกฝั่งไม่รู้ตัว
