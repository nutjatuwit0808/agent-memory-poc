---
layer: structure
tags: [provisioning, module, core]
created: 2025-11-03
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy]]"
---

# Module: device-provisioning

จัดการวงจรชีวิตของอุปกรณ์ GPS tracker ตั้งแต่ลงทะเบียนอุปกรณ์ใหม่ ผูกกับยานพาหนะ ไปจนถึงปลดการใช้งานเมื่อยกเลิกสัญญาหรือฮาร์ดแวร์เสีย เป็น service เดียวที่มีสิทธิ์เขียนตาราง `devices` สถานะ lifecycle ได้ — [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] อ่านอย่างเดียวเพื่อรู้ว่าอุปกรณ์ไหน active

## ฟังก์ชันหลัก
- `activateDevice(deviceId: string, vehicleId: string, customerId: string): Promise<void>` — ผูกอุปกรณ์กับยานพาหนะและเริ่มรับ ping
- `deactivateDevice(deviceId: string, reason: string): Promise<void>` — ปลดอุปกรณ์ออกจากการใช้งาน ไม่ลบประวัติ ping เดิม
- `reassignDevice(deviceId: string, newVehicleId: string): Promise<void>` — ย้ายอุปกรณ์ไปติดรถคันอื่น เช่น ตอนเปลี่ยนรถซ่อมบำรุง

## State

provisioned → active → (ปลดการใช้งาน) → deactivated — ดู [[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy]] สำหรับเงื่อนไขการย้ายอุปกรณ์ข้ามรถ

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] เช็คสถานะ active ก่อนรับ ping ทุกครั้งแต่ device-provisioning ไม่รู้จัก concept ของ ping หรือตำแหน่งเลย — รู้แค่ว่าอุปกรณ์ไหนควรรับสัญญาณได้ เป็นการตัดสินใจ lifecycle ทั้งหมดอยู่ที่ service นี้
