---
layer: convention
tags: [error, api]
created: 2025-11-02
links:
  - "[[convention/synthetic-iot-fleet-tracker/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`TRK_<DOMAIN>_<REASON>` เช่น `TRK_INGEST_INVALID_PAYLOAD`, `TRK_GEOFENCE_ZONE_NOT_FOUND` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`TRK_DEVICE_OFFLINE`, `TRK_TRIP_FLAGGED_FOR_REVIEW`, `TRK_ROUTE_NO_ALTERNATIVE` — ดูรายชื่อเต็มที่ [[convention/synthetic-iot-fleet-tracker/api-response-format]]
