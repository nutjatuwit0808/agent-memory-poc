---
layer: structure
tags: [scheduling, module, core]
created: 2025-10-20
links:
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
  - "[[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy]]"
---

# Module: maintenance-scheduler

คำนวณว่า vehicle คันไหนถึงกำหนดบำรุงรักษาเมื่อไหร่ โดยใช้ทั้ง odometer-based trigger (ทุก N กม.) และ time-based trigger (ทุก N วัน) แล้วแต่เงื่อนไขไหนถึงก่อน แยกออกมาเป็น service เดียวกันเพราะ logic การคำนวณ trigger มีความซับซ้อนของตัวเองและต้องการ historical odometer data ที่เก็บแยกต่างหาก

## ฟังก์ชันหลัก
- `checkDueVehicles(): Promise<MaintenanceDue[]>` — ตรวจรายการ vehicle ที่ถึงกำหนดบำรุงรักษาจาก odometer และ last-service date
- `updateOdometer(vehicleId: string, currentKm: number, recordedAt: string): Promise<void>` — อัปเดต odometer ของรถเมื่อกลับอู่ ตรวจ plausibility ก่อนบันทึก
- `scheduleNextService(vehicleId: string, serviceType: ServiceType): Promise<ServiceSchedule>` — คำนวณวัน/ระยะทางของบำรุงรักษารอบถัดไปหลังทำเสร็จ
- `getDueNotifications(lookaheadDays: number): Promise<VehicleDueNotice[]>` — ดึงรายการรถที่ใกล้ถึงกำหนดตาม lookahead window เพื่อแจ้งล่วงหน้า

## State

vehicle: active → due (ถึงกำหนดบำรุง) → in_service (รับ work order แล้ว) → active (หลังเสร็จและ schedule ถัดไปคำนวณแล้ว) | decommissioned (terminal)

## ความสัมพันธ์กับ module อื่น

ไม่รู้จัก work order เลย — หลังพบว่าถึงกำหนด จะ publish `maintenance.due` event ให้ [[structure/synthetic-fleet-maintenance/module-work-order-manager]] สร้าง work order เอง เหตุผลที่แยก เพราะ scheduler ต้องทำงานต่อแม้ work-order-manager จะยุ่งหรือล่ม ดู [[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy]]
