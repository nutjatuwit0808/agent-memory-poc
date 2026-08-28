---
layer: convention
tags: [logging, observability]
created: 2025-10-28
links:
  - "[[deployment/synthetic-supply-chain/monitoring-alerts]]"
  - "[[support-cases/synthetic-supply-chain/case-8159]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ PO ต้องมี `poId` เสมอ เพื่อไล่ log ข้าม service ได้ (purchase-order-engine → goods-receipt-processor → quality-inspection-gate) ดู [[deployment/synthetic-supply-chain/monitoring-alerts]]

## ระดับ log

Rejection event และ blacklist change ต้อง log เป็น `warn` ขึ้นไปเสมอ background job ที่ fail ต้องไม่ suppress error เงียบๆ ต้องมี `error` log พร้อม stack trace ทุกครั้ง บทเรียนจาก [[support-cases/synthetic-supply-chain/case-8159]]
