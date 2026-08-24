---
layer: structure
tags: [provisioning, module, core, reference, identifiers]
created: 2026-02-28
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-device-provisioning]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy]]"
---

# device-provisioning — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด device-provisioning สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-iot-fleet-tracker/module-device-provisioning]])

## Public functions
- `activateDevice(deviceId: string, vehicleId: string, customerId: string): Promise<void>` — ผูกอุปกรณ์กับยานพาหนะและเริ่มรับ ping
- `deactivateDevice(deviceId: string, reason: string): Promise<void>` — ปลดอุปกรณ์ออกจากการใช้งาน ไม่ลบประวัติ ping เดิม
- `reassignDevice(deviceId: string, newVehicleId: string): Promise<void>` — ย้ายอุปกรณ์ไปติดรถคันอื่น เช่น ตอนเปลี่ยนรถซ่อมบำรุง

## Internal constants
- `DEVICE_ID_PREFIX = "TRK-"`
- `REASSIGNMENT_COOLDOWN_HOURS = 1`

## Type

```ts
interface DeviceRecord {
  deviceId: string;
  vehicleId: string | null;
  customerId: string;
  status: "provisioned" | "active" | "deactivated";
  activatedAt: string | null;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการย้ายอุปกรณ์ข้ามรถที่ [[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy]]
