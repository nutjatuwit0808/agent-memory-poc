---
layer: convention
tags: [signal, schema, events]
created: 2026-04-02
links:
  - "[[structure/synthetic-fraud-detection/module-signal-collector]]"
  - "[[support-cases/synthetic-fraud-detection/case-1671]]"
  - "[[support-cases/synthetic-fraud-detection/case-1126]]"
---

# Signal Schema Convention

ทุก signal ที่ [[structure/synthetic-fraud-detection/module-signal-collector]] รับเข้ามาต้องผ่าน schema validation ตาม SIGNAL_SCHEMA_VERSION ปัจจุบัน เอกสารนี้กำหนด field, unit, และ กติกาการ versioning เพื่อป้องกัน schema drift ซ้ำอีก (ดูบทเรียนจาก [[support-cases/synthetic-fraud-detection/case-1671]])

## Field บังคับและหน่วย

`eventId` UUID v4, `eventType` enum, `userId` string, `deviceId` string, `ip` IPv4/IPv6, `receivedAt` ISO 8601 UTC — ทุก numeric field ต้องระบุหน่วยใน field name เช่น `session_duration_sec` ไม่ใช่ `session_duration` เพื่อป้องกัน unit mismatch (ดู [[support-cases/synthetic-fraud-detection/case-1126]])

## กติกาการ versioning

ทุกครั้งที่ rename, remove, หรือ change unit ของ field ต้อง bump SIGNAL_SCHEMA_VERSION และผ่าน review จาก Data Science team ก่อน deploy — breaking change ที่ไม่ coordinate ทำให้เกิด model drift ได้ทันที
