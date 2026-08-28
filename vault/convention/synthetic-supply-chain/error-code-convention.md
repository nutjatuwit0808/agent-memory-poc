---
layer: convention
tags: [error, api]
created: 2026-08-18
links:
  - "[[convention/synthetic-supply-chain/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`SUPPLY_<DOMAIN>_<REASON>` เช่น `SUPPLY_PO_BELOW_MOQ`, `SUPPLY_SUPPLIER_BLACKLISTED`, `SUPPLY_RECEIPT_DISCREPANCY` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`SUPPLY_PO_DUPLICATE`, `SUPPLY_SUPPLIER_PROBATION`, `SUPPLY_INSPECTION_REJECTED` — ดูรายชื่อเต็มที่ [[convention/synthetic-supply-chain/api-response-format]]
