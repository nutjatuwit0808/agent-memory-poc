---
layer: structure
tags: [cache, module, core, reference, identifiers]
created: 2025-11-18
links:
  - "[[structure/synthetic-content-delivery/module-cache-coordinator]]"
  - "[[business-logic/synthetic-content-delivery/cache-ttl-policy]]"
---

# cache-coordinator — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด cache-coordinator สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-content-delivery/module-cache-coordinator]])

## Public functions
- `lookupEntry(tenantId: string, contentKey: string): Promise<CacheEntry | null>` — ตรวจสอบว่ามี cache entry สำหรับ content key นี้และยัง fresh อยู่หรือไม่
- `recordPull(tenantId: string, contentKey: string, meta: ContentMeta): Promise<CacheEntry>` — บันทึก metadata หลังจาก origin pull สำเร็จ คืน entry ที่จะใช้สร้าง response header
- `markStale(tenantId: string, contentKey: string): Promise<void>` — บังคับให้ entry เป็น stale ทันทีเพื่อให้ request ถัดไป revalidate จาก origin
- `computeEffectiveTtl(tenantId: string, contentType: string): number` — คำนวณ TTL จริงจาก tenant config และ content-type rule ตาม [[business-logic/synthetic-content-delivery/cache-ttl-policy]]

## Internal constants
- `DEFAULT_TTL_SECONDS = 3600`
- `MAX_TTL_SECONDS = 86400`
- `STALE_REVALIDATE_WINDOW_SECONDS = 300`

## Type

```ts
interface CacheEntry {
  tenantId: string;
  contentKey: string;
  etag: string;
  contentHash: string;
  expiresAt: Date;
  status: "fresh" | "stale" | "revalidating" | "expired";
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-content-delivery/cache-ttl-policy]]
