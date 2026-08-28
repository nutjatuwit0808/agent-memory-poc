---
layer: convention
tags: [events, driver, schema]
created: 2026-02-05
links:
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
---

# Driver Event Schema Convention

คนขับทุกคนส่ง location update เข้า [[structure/synthetic-food-delivery/module-driver-dispatch]] ทุก `DISPATCH_LOCATION_INTERVAL_SEC` วินาที เอกสารนี้กำหนด schema ของ event ที่ต้องใช้ตรงกันทุก app version

## Location update event

ต้องมี field บังคับ: `driverId`, `timestamp` (ISO 8601 UTC), `lat`, `lng`, `accuracy_m` — ขาด field ใดตัวหนึ่ง driver-dispatch จะ reject และ log เป็น `warn` ไม่ใช่ `error` เพราะ single missed update ไม่ถือว่า critical

## Status event

`driver.went_online` และ `driver.went_offline` ต้องมี `reason` field เสมอ (`manual`, `battery_low`, `connection_lost`) เพื่อให้ ops วิเคราะห์ pattern offline ได้
