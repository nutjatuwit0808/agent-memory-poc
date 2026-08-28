---
layer: deployment
tags: [asset-management, assettrack, environment, config, reference]
created: 2025-11-25
links:
  - "[[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy]]"
  - "[[business-logic/synthetic-asset-management/license-overallocation-policy]]"
  - "[[business-logic/synthetic-asset-management/depreciation-method-policy]]"
  - "[[business-logic/synthetic-asset-management/procurement-approval-tier-policy]]"
---

# Environment Variables Reference — AssetTrack — ระบบจัดการสินทรัพย์องค์กร

## asset-registry-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ASSET_REGISTRY_DB_URL` | `postgres://asset-db.internal:5432/assets` | secret ห้าม log |
| `ASSET_HISTORY_RETENTION_YEARS` | `10` | ดู [[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy]] |

## license-pool-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `LICENSE_WARNING_THRESHOLD_PCT` | `90` | ดู [[business-logic/synthetic-asset-management/license-overallocation-policy]] |
| `LICENSE_VENDOR_SYNC_INTERVAL_HOURS` | `24` | ความถี่ sync จำนวน seat จาก vendor portal |

## depreciation-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `DEPRECIATION_DEFAULT_LIFE_HARDWARE_YEARS` | `3` | ดู [[business-logic/synthetic-asset-management/depreciation-method-policy]] |
| `DEPRECIATION_DEFAULT_LIFE_NETWORK_YEARS` | `5` | ดู [[business-logic/synthetic-asset-management/depreciation-method-policy]] |
| `DEPRECIATION_RESIDUAL_VALUE_PCT` | `10` | มูลค่าซาก ใช้ในทั้ง Straight-line และ Double-declining |

## procurement-handler-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PROCUREMENT_TIER1_LIMIT_THB` | `50000` | วงเงิน tier 1 ที่ manager อนุมัติได้ ดู [[business-logic/synthetic-asset-management/procurement-approval-tier-policy]] |
| `PROCUREMENT_TIER2_LIMIT_THB` | `500000` | วงเงิน tier 2 ที่ director ต้องอนุมัติ |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
