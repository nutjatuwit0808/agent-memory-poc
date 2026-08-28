---
layer: structure
tags: [content-delivery, edgeserve, gateway, api]
created: 2026-02-26
links:
  - "[[structure/synthetic-content-delivery/module-origin-puller]]"
  - "[[business-logic/synthetic-content-delivery/cache-ttl-policy]]"
---

# API Gateway

Request จาก client เข้ามาที่ anycast entry point แล้วถูก route ไปยัง PoP (Point of Presence) ที่ใกล้ที่สุดโดยอัตโนมัติ PoP แต่ละจุดตรวจสอบ cache ก่อน ถ้าเจอ (cache hit) จะตอบกลับทันทีโดยไม่ต้องคุย control plane เลย

เฉพาะ cache miss และ cache revalidation เท่านั้นที่จะเรียกกลับมาหา [[structure/synthetic-content-delivery/module-origin-puller]] ผ่าน control plane — นี่คือเหตุผลที่ cache hit rate เป็น metric สำคัญที่สุดของ EdgeServe ถ้า cache hit ต่ำ origin จะถูก flood ด้วย request จำนวนมาก ดู [[business-logic/synthetic-content-delivery/cache-ttl-policy]]
