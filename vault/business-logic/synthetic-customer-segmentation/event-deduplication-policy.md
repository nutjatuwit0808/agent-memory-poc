---
layer: business-logic
tags: [deduplication, data-quality, policy]
created: 2026-08-09
links:
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
---

# นโยบายการ Deduplicate Event

[[structure/synthetic-customer-segmentation/module-event-ingester]] ตรวจ duplicate โดยใช้ fingerprint ที่คำนวณจาก combination ของ `source`, `eventType`, `customerToken`, และ `occurredAt` รายการที่ fingerprint ตรงกันภายใน `EVENT_DEDUP_WINDOW_HOURS` จะถูก reject เงียบๆ พร้อม status `duplicate`

event ที่ถูก reject เป็น duplicate ไม่ถูกบันทึกลง store แต่จะ log fingerprint ไว้ใน `event_dedup_log` เพื่อให้ตรวจสอบย้อนหลังได้ว่า event ไหน duplicate มาจากที่ใด
