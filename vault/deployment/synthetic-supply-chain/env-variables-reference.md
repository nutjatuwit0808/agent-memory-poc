---
layer: deployment
tags: [supply-chain, supplylink, environment, config, reference]
created: 2025-10-31
links:
  - "[[business-logic/synthetic-supply-chain/lead-time-sla-policy]]"
  - "[[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]]"
  - "[[business-logic/synthetic-supply-chain/goods-receipt-discrepancy-policy]]"
  - "[[business-logic/synthetic-supply-chain/replenishment-threshold-policy]]"
---

# Environment Variables Reference — SupplyLink — ระบบจัดการห่วงโซ่อุปทาน

## purchase-order-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PO_DRAFT_EXPIRY_DAYS` | `7` | PO ที่ยังเป็น draft เกินนี้จะถูก archive อัตโนมัติ |
| `SUPPLIER_CONFIRM_TIMEOUT_HOURS` | `48` | ดู [[business-logic/synthetic-supply-chain/lead-time-sla-policy]] |
| `PO_DB_URL` | `postgres://po-db.internal:5432/supplylink_po` | secret ห้าม log |

## supplier-catalog-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `BLACKLIST_AUTO_REVIEW_DAYS` | `90` | ดู [[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]] |
| `PERFORMANCE_LOOKBACK_DAYS` | `180` | ช่วงเวลาที่คำนวณ performance score |
| `PROBATION_THRESHOLD_SCORE` | `60` | ต่ำกว่านี้ถูก flag probation |

## goods-receipt-processor-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PARTIAL_RECEIPT_TOLERANCE_PCT` | `5` | ยอมรับสินค้าน้อยกว่า PO ได้ไม่เกินเปอร์เซ็นต์นี้ ดู [[business-logic/synthetic-supply-chain/goods-receipt-discrepancy-policy]] |
| `INSPECTION_SUBMIT_TIMEOUT_HOURS` | `24` | เวลาสูงสุดที่รอผลตรวจสอบก่อน escalate |

## replenishment-trigger-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `REPLENISHMENT_EVAL_INTERVAL_MIN` | `30` | ความถี่ในการประเมิน reorder need แต่ละ SKU |
| `MAX_AUTO_PO_VALUE_THB` | `500000` | PO ที่มูลค่าเกินนี้ต้องมีคนอนุมัติก่อน ดู [[business-logic/synthetic-supply-chain/replenishment-threshold-policy]] |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
