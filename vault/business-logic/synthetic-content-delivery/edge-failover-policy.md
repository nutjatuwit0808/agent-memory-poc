---
layer: business-logic
tags: [edge, failover, policy]
created: 2026-06-26
links:
  - "[[structure/synthetic-content-delivery/module-geo-router]]"
---

# นโยบาย Edge Node Failover

เมื่อ edge node หนึ่งจุดออฟไลน์หรือตอบสนองช้าเกินเกณฑ์ [[structure/synthetic-content-delivery/module-geo-router]] จะ reroute traffic ไปยัง PoP อื่นในภูมิภาคเดียวกันโดยอัตโนมัติ ถ้าไม่มี PoP อื่นในภูมิภาค จะข้ามไปใช้ PoP ที่ใกล้ที่สุดแม้จะอยู่ต่าง region

Failover ตัดสินใจตาม health check ที่รัน ทุก 10 วินาที — edge node ที่ไม่ตอบ health check 3 ครั้งติดต่อกันจะถูกถอดออกจาก routing pool ชั่วคราว และจะถูกคืนเมื่อตอบสนองปกติ 5 ครั้งติดต่อกัน
