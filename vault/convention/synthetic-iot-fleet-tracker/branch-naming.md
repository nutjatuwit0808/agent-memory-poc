---
layer: convention
tags: [git, workflow]
created: 2026-06-12
links:
  - "[[convention/synthetic-iot-fleet-tracker/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/TRK-118-geofence-debounce-tuning`, `fix/TRK-203-route-recompute-loop`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-iot-fleet-tracker/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
