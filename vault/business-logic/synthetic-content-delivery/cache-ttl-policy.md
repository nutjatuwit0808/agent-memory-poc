---
layer: business-logic
tags: [cache, ttl, policy]
created: 2025-11-03
links:
  - "[[structure/synthetic-content-delivery/module-cache-coordinator]]"
  - "[[business-logic/synthetic-content-delivery/cache-ttl-policy-edge-cases]]"
---

# นโยบาย Cache TTL ตาม Content Type

[[structure/synthetic-content-delivery/module-cache-coordinator]] ใช้ TTL ที่แตกต่างกันตาม content type เพื่อสมดุลระหว่าง freshness ของเนื้อหาและ cache hit rate — เนื้อหาที่เปลี่ยนน้อย เช่น video ที่ publish แล้ว ได้รับ TTL ยาว ส่วนเนื้อหาที่เปลี่ยนบ่อย เช่น playlist หรือ index page ได้รับ TTL สั้น

Tenant สามารถกำหนด TTL ของตัวเองได้ในกรอบ `MIN_TTL_SECONDS` ถึง `MAX_TTL_SECONDS` แต่ไม่สามารถตั้งต่ำกว่าหรือสูงกว่าขอบเขตนั้นได้ เพื่อป้องกันทั้ง origin overload (TTL ต่ำเกินไป) และ stale content นานเกินไป (TTL สูงเกินไป)

## TTL เริ่มต้นตาม content type

| Content Type | Default TTL | เหตุผล |
|---|---|---|
| video (mp4/ts) | 24h | เปลี่ยนน้อยมากหลัง publish |
| audio (mp3/aac) | 12h | เช่นเดียวกับ video |
| image | 6h | อาจมีการอัปเดต thumbnail |
| manifest/playlist (m3u8) | 30s | เปลี่ยนทุกครั้งที่มี segment ใหม่ |
| html/api response | 5m | เนื้อหาเว็บเปลี่ยนบ่อยกว่า media |

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-content-delivery/cache-ttl-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
