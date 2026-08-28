---
layer: structure
tags: [cache, module, core]
created: 2025-11-30
links:
  - "[[business-logic/synthetic-content-delivery/cache-ttl-policy]]"
  - "[[structure/synthetic-content-delivery/module-invalidation-dispatcher]]"
  - "[[structure/synthetic-content-delivery/module-origin-puller]]"
---

# Module: cache-coordinator

รับผิดชอบ metadata ของ cache entry ทั้งหมด ได้แก่ TTL ที่ใช้งาน, ETag, และ content hash ที่ใช้ตรวจสอบ freshness แยกออกมาจาก origin-puller เพราะ logic การตัดสินใจว่า "ควร cache อยู่อีกนานแค่ไหน" ซับซ้อนขึ้นเรื่อยๆ ตาม content type และ policy ของ tenant แต่ละราย จนปนกับ logic การดึงเนื้อหาแล้วทดสอบยาก

## ฟังก์ชันหลัก
- `lookupEntry(tenantId: string, contentKey: string): Promise<CacheEntry | null>` — ตรวจสอบว่ามี cache entry สำหรับ content key นี้และยัง fresh อยู่หรือไม่
- `recordPull(tenantId: string, contentKey: string, meta: ContentMeta): Promise<CacheEntry>` — บันทึก metadata หลังจาก origin pull สำเร็จ คืน entry ที่จะใช้สร้าง response header
- `markStale(tenantId: string, contentKey: string): Promise<void>` — บังคับให้ entry เป็น stale ทันทีเพื่อให้ request ถัดไป revalidate จาก origin
- `computeEffectiveTtl(tenantId: string, contentType: string): number` — คำนวณ TTL จริงจาก tenant config และ content-type rule ตาม [[business-logic/synthetic-content-delivery/cache-ttl-policy]]

## State

fresh → stale (TTL หมด หรือถูก invalidate) → revalidating → fresh | expired — ดู [[business-logic/synthetic-content-delivery/cache-ttl-policy]] สำหรับเงื่อนไขการเปลี่ยน state

## ความสัมพันธ์กับ module อื่น

ไม่เก็บ content จริงเลย — content จริงอยู่ที่ edge node แต่ละ PoP [[structure/synthetic-content-delivery/module-invalidation-dispatcher]] เรียก `markStale` เมื่อ tenant ส่ง invalidation request เข้ามา ส่วน [[structure/synthetic-content-delivery/module-origin-puller]] เรียก `recordPull` เมื่อดึงเนื้อหาใหม่ได้สำเร็จ
