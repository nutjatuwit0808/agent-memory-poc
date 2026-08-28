---
layer: structure
tags: [content-delivery, edgeserve, boundaries]
created: 2026-06-27
links:
  - "[[structure/synthetic-content-delivery/module-cache-coordinator]]"
  - "[[structure/synthetic-content-delivery/module-geo-router]]"
---

# Service Boundaries

[[structure/synthetic-content-delivery/module-cache-coordinator]] เป็นเจ้าของ metadata ของ cache entry ทั้งหมด (TTL, ETag, content hash) แต่ไม่เก็บ content จริง — content จริงอยู่ที่ edge node แต่ละจุดตาม region ที่ร้องขอ ทำให้ [[structure/synthetic-content-delivery/module-cache-coordinator]] มีขนาดเล็กและ query เร็ว แต่ต้องคุย edge node เมื่อต้องการตรวจสอบ freshness จริง

[[structure/synthetic-content-delivery/module-geo-router]] เป็น service เดียวที่รู้จักทั้ง topology ของ edge network และ geo-restriction rule ของแต่ละ tenant — service อื่นไม่รู้ว่าจะ route traffic ไป edge node ไหน และไม่รู้ว่า content ชิ้นไหนถูกจำกัดประเทศอะไร การรวมสองความรู้นี้ไว้จุดเดียวทำให้ rule update มีจุดเดียวที่ต้องดูแล
