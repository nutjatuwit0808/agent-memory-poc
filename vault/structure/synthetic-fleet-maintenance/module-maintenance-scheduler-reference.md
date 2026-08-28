---
layer: structure
tags: [scheduling, module, core, reference, identifiers]
created: 2026-08-11
links:
  - "[[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]"
  - "[[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy]]"
---

# maintenance-scheduler — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด maintenance-scheduler สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]])

## Public functions
- `checkDueVehicles(): Promise<MaintenanceDue[]>` — ตรวจรายการ vehicle ที่ถึงกำหนดบำรุงรักษาจาก odometer และ last-service date
- `updateOdometer(vehicleId: string, currentKm: number, recordedAt: string): Promise<void>` — อัปเดต odometer ของรถเมื่อกลับอู่ ตรวจ plausibility ก่อนบันทึก
- `scheduleNextService(vehicleId: string, serviceType: ServiceType): Promise<ServiceSchedule>` — คำนวณวัน/ระยะทางของบำรุงรักษารอบถัดไปหลังทำเสร็จ
- `getDueNotifications(lookaheadDays: number): Promise<VehicleDueNotice[]>` — ดึงรายการรถที่ใกล้ถึงกำหนดตาม lookahead window เพื่อแจ้งล่วงหน้า

## Internal constants
- `ODOMETER_PLAUSIBILITY_MAX_JUMP_KM = 1000`
- `MAINTENANCE_DUE_LOOKAHEAD_DAYS = 7`
- `MIN_INTERVAL_KM_BETWEEN_CHECKS = 500`

## Type

```ts
interface MaintenanceDue {
  vehicleId: string;
  serviceType: "preventive" | "scheduled_inspection" | "annual";
  triggerReason: "odometer" | "time" | "both";
  daysOverdue: number;
  kmOverdue: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy]]
