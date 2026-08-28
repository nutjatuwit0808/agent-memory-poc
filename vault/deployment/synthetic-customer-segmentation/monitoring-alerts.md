---
layer: deployment
tags: [monitoring, observability]
created: 2026-02-16
links:
  - "[[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]"
---

# Monitoring & Alerts

## Alert หลัก

event ingestion lag เกิน 2 ชั่วโมง, membership refresh ล้มเหลวหรือ timeout, export ล้มเหลวเกิน 3 channel ใน 30 นาที (ดู [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]), segment health score ต่ำกว่า `HEALTH_CRITICAL_THRESHOLD`

## ช่องทางแจ้งเตือน

Sev1 (PII/data loss) แจ้ง on-call + DPO ทันที, Sev2 แจ้ง on-call, Sev3 รวมเป็น digest รายชั่วโมง
