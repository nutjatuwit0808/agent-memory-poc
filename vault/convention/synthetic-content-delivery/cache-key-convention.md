---
layer: convention
tags: [cache, convention]
created: 2026-06-01
links:
  - "[[support-cases/synthetic-content-delivery/case-8297]]"
---

# Cache Key Convention

Cache key ต้องสร้างอย่างสม่ำเสมอและ deterministic เพื่อให้ cache hit rate สูงสุดและป้องกัน cache pollution — เอกสารนี้กำหนด format และกฎที่ใช้

## รูปแบบ

`{tenantId}/{normalized_path}?{sorted_query_string}` — `tenantId` ต้องอยู่เสมอโดยไม่มีข้อยกเว้น ดูบทเรียนจาก [[support-cases/synthetic-content-delivery/case-8297]] — path ต้อง normalize ด้วย lowercase และตัด trailing slash ออก — query parameter ต้อง sort alphabetically ก่อน join

## Query parameter ที่ไม่นับใน cache key

Parameter ที่ใช้เพื่อ analytics หรือ tracking เท่านั้น เช่น `utm_source`, `fbclid`, `gclid` ต้องถูกตัดออกก่อน generate cache key เพราะถ้าใส่เข้าไปจะทำให้ cache hit rate ลดลงมากโดยไม่จำเป็น — list ของ parameter ที่ตัดออกเป็น whitelist ที่ config ได้ต่อ tenant
