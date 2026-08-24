---
layer: structure
tags: [feature-store, module, core]
created: 2026-05-22
links:
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
  - "[[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]]"
---

# Module: feature-store

ศูนย์กลาง feature วิศวกรรมทั้งหมดที่ป้อนให้โมเดล (rolling sales average, ราคา, promo flag, category average, ฯลฯ) ทุก feature มี version และ timestamp ชัดเจน แยกออกมาเป็น service กลางเพื่อไม่ให้แต่ละโมเดลคำนวณ feature ซ้ำกันคนละสูตร

## ฟังก์ชันหลัก
- `getFeatureVector(skuId: string, storeId: string, asOfDate: string): Promise<FeatureVector>` — คืน feature vector ล่าสุดที่ไม่เกิน MAX_FEATURE_LAG_HOURS ณ เวลาที่ขอ
- `writeFeatureBatch(featureSetId: string, rows: FeatureRow[]): Promise<void>` — เขียน feature batch ใหม่เข้าระบบ พร้อม version ใหม่
- `invalidateStaleFeatures(featureSetId: string): Promise<void>` — mark feature set เป็น stale เมื่อ source data ล่าช้าเกินกำหนด

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-inventory-forecasting/module-demand-model-runner]] เรียก `getFeatureVector` ก่อนรันโมเดลทุกครั้ง แต่ feature-store ไม่รู้จัก concept ของ "โมเดล" หรือ "การพยากรณ์" เลย — รู้แค่ว่า feature ตัวไหนสดหรือไม่สด ความหมายว่า feature เก่าแค่ไหนถึงใช้ไม่ได้กำหนดโดย [[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]]
