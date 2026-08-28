---
layer: structure
tags: [content-delivery, edgeserve, architecture, overview]
created: 2026-04-15
links:
  - "[[structure/synthetic-content-delivery/module-cache-coordinator]]"
  - "[[structure/synthetic-content-delivery/module-origin-puller]]"
  - "[[structure/synthetic-content-delivery/module-invalidation-dispatcher]]"
  - "[[structure/synthetic-content-delivery/module-geo-router]]"
  - "[[structure/synthetic-content-delivery/module-certificate-manager]]"
  - "[[structure/synthetic-content-delivery/module-bandwidth-throttler]]"
---

# ภาพรวมสถาปัตยกรรม EdgeServe — ระบบกระจายเนื้อหา (CDN)

EdgeServe คือแพลตฟอร์ม CDN สำหรับบริษัทสื่อและ streaming ที่ต้องการกระจายเนื้อหาไปยัง edge node ทั่วโลก ระบบทำหน้าที่ตั้งแต่ดึงเนื้อหาจาก origin server ไปจนถึงจัดการ cache ที่ edge การกำหนดเส้นทาง geo-routing และการต่ออายุ SSL certificate โดยอัตโนมัติ

ทีมวิศวกรรม EdgeServe ออกแบบให้ edge node แต่ละจุดสามารถทำงานได้กึ่งอิสระจาก control plane เพื่อให้ส่งเนื้อหาได้แม้ในช่วงที่ network ระหว่าง region มีปัญหา แต่นั่นก็หมายความว่า cache invalidation และ geo-rule update ต้องมีกลไก propagation ที่รัดกุม ไม่งั้น edge บางจุดจะเสิร์ฟเนื้อหาเก่าหรือตอบผิด geo-restriction

## Module หลัก

- **cache-coordinator** — รับผิดชอบ metadata ของ cache entry ทั้งหมด ได้แก่ TTL ที่ใช้งาน, ETag, และ content hash ที่ใช้ตรวจสอบ freshness แยกออกมาจาก origin-puller เพราะ logic การตัดสินใจว่า "ควร cache อยู่อีกนานแค่ไหน" ซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-content-delivery/module-cache-coordinator]]
- **origin-puller** — ดึงเนื้อหาจาก origin server ของ tenant เมื่อ cache miss หรือเมื่อ cache coordina ดู [[structure/synthetic-content-delivery/module-origin-puller]]
- **invalidation-dispatcher** — รับ invalidation request จาก tenant และ propagate ไปยัง edge node ทุกจุดที่มี ca ดู [[structure/synthetic-content-delivery/module-invalidation-dispatcher]]
- **geo-router** — ตัดสินใจว่าจะส่ง request จาก client ไปยัง edge node จุดไหน โดยพิจารณาทั้งความใกล ดู [[structure/synthetic-content-delivery/module-geo-router]]
- **certificate-manager** — จัดการ lifecycle ของ SSL/TLS certificate ทั้งหมดที่ EdgeServe ใช้สำหรับ edge nod ดู [[structure/synthetic-content-delivery/module-certificate-manager]]
- **bandwidth-throttler** — ควบคุม bandwidth ที่แต่ละ tenant ใช้ได้ตาม quota ที่ตกลงไว้ในสัญญา และทำ adaptiv ดู [[structure/synthetic-content-delivery/module-bandwidth-throttler]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-content-delivery/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-content-delivery/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-content-delivery/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-content-delivery/database-schema]]
