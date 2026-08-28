---
layer: convention
tags: [logging, observability]
created: 2026-01-25
links:
  - "[[deployment/synthetic-asset-management/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ asset lifecycle ต้องมี `assetId` เสมอ เพื่อไล่ log ข้าม module ได้ (asset-registry → assignment-tracker → disposal-workflow) ดู [[deployment/synthetic-asset-management/monitoring-alerts]]

## ระดับ log

compliance-related action เช่น disposal, license allocation/revoke log เป็น `info` เสมอแม้ปกติ เพื่อให้ audit trail ครบถ้วนแม้ไม่เกิด error
