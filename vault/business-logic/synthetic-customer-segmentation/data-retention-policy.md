---
layer: business-logic
tags: [retention, compliance, policy]
created: 2026-01-15
links:
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
---

# นโยบาย Data Retention ของ Event Store

raw event ใน [[structure/synthetic-customer-segmentation/module-event-ingester]] ถูก retain ไว้ 365 วัน หลังจากนั้นจะถูก purge โดย `purgeEventsOlderThan` job ที่รันรายสัปดาห์ membership snapshot ใน [[structure/synthetic-customer-segmentation/module-membership-refresher]] ถูก retain 90 วัน (เก็บแค่ snapshot ล่าสุดของแต่ละ segment ไม่ใช่ทุก snapshot)

การ extend retention เกินค่า default ต้องได้รับการอนุมัติจาก Data Protection Officer และต้องมีเหตุผลทางกฎหมายที่ชัดเจน เช่น litigation hold
