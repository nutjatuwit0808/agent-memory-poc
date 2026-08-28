---
layer: structure
tags: [geofence, module]
created: 2026-01-26
links:
  - "[[business-logic/synthetic-telematics/geofence-alert-cooldown-policy]]"
---

# Module: geofence-monitor

ตรวจสอบว่าตำแหน่งรถอยู่ในเขตพื้นที่ที่กำหนด (geofence) หรือไม่ ใช้สำหรับผลิตภัณฑ์ประกันที่มีเงื่อนไขพื้นที่ใช้งาน (เช่น ประกันสำหรับรถที่ใช้งานในเขตเมืองเท่านั้น) แจ้งเตือนเมื่อรถออกนอกเขตที่กำหนด

## ฟังก์ชันหลัก
- `checkGeofence(deviceId: string, point: GpsPoint): Promise<GeofenceStatus>` — ตรวจสอบว่าตำแหน่งปัจจุบันอยู่ในเขต geofence ที่กำหนดหรือไม่
- `raiseGeofenceAlert(policyholderId: string, deviceId: string): Promise<void>` — แจ้งเตือนเมื่อรถออกนอกเขตที่กำหนด
- `updateGeofenceZones(policyholderId: string, zones: GeofenceZone[]): Promise<void>` — อัปเดตเขตพื้นที่ที่กำหนดสำหรับกรมธรรม์หนึ่ง

## ความสัมพันธ์กับ module อื่น

ไม่ trigger การแจ้งเตือนทุกครั้งที่ออกนอกเขต มี cooldown ตาม [[business-logic/synthetic-telematics/geofence-alert-cooldown-policy]] เพื่อไม่ให้แจ้งเตือนถี่เกินไปเมื่อรถวิ่งใกล้ขอบเขตพอดี
