---
layer: structure
tags: [feature-store, module, core, reference, identifiers]
created: 2025-10-11
links:
  - "[[structure/synthetic-inventory-forecasting/module-feature-store]]"
  - "[[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]]"
---

# feature-store — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด feature-store สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-inventory-forecasting/module-feature-store]])

## Public functions
- `getFeatureVector(skuId: string, storeId: string, asOfDate: string): Promise<FeatureVector>` — คืน feature vector ล่าสุดที่ไม่เกิน MAX_FEATURE_LAG_HOURS ณ เวลาที่ขอ
- `writeFeatureBatch(featureSetId: string, rows: FeatureRow[]): Promise<void>` — เขียน feature batch ใหม่เข้าระบบ พร้อม version ใหม่
- `invalidateStaleFeatures(featureSetId: string): Promise<void>` — mark feature set เป็น stale เมื่อ source data ล่าช้าเกินกำหนด

## Internal constants
- `FEATURE_TTL_HOURS = 26`
- `MAX_FEATURE_LAG_HOURS = 30`

## Type

```ts
interface FeatureVector {
  skuId: string;
  storeId: string;
  asOfDate: string;
  rollingAvg28d: number;
  priceIndex: number;
  promoFlag: boolean;
  categoryAvgFallback: number;
  featureSetVersion: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องความสดของ feature ที่ [[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]]
