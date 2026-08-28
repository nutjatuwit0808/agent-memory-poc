---
layer: structure
tags: [downtime, module]
created: 2025-09-08
links:
  - "[[business-logic/synthetic-fleet-maintenance/downtime-sla-threshold-policy]]"
---

# Module: downtime-tracker

นับเวลาที่รถไม่สามารถใช้งานได้ตาม SLA ที่ตกลงไว้กับลูกค้า ติดตาม downtime event ตั้งแต่เริ่มจนสิ้นสุด คำนวณ downtime accumulated และแจ้งเตือนเมื่อใกล้เกิน threshold แยกออกมาเพราะการวัด downtime ต้องการ timestamp ที่แม่นยำและต้องเชื่อมหลาย event source เข้าด้วยกัน

## ฟังก์ชันหลัก
- `startDowntime(vehicleId: string, reason: DowntimeReason, startedAt: string): Promise<DowntimeEventId>` — เริ่มนับ downtime clock สำหรับรถคันนั้น
- `endDowntime(eventId: string, endedAt: string, resolution: string): Promise<DowntimeDuration>` — หยุดนับและบันทึก total downtime duration
- `getVehicleDowntimeSummary(vehicleId: string, periodDays: number): Promise<DowntimeSummary>` — รายงาน downtime รวมของรถในช่วงเวลาที่กำหนด
- `checkSlaBreachRisk(vehicleId: string): Promise<SlaStatus>` — ตรวจว่ารถคันนั้นใกล้เกิน downtime SLA ที่ตกลงไว้หรือไม่ ดู [[business-logic/synthetic-fleet-maintenance/downtime-sla-threshold-policy]]

## ความสัมพันธ์กับ module อื่น

subscribe `workorder.opened` และ `vehicle.breakdown` เพื่อเริ่มนับ downtime อัตโนมัติ แต่ถ้า event ไม่ส่งมา (เช่นรถเสียกลางทาง) ช่างสามารถ call `startDowntime` ด้วยมือพร้อมระบุ `startedAt` ย้อนหลังได้ ดู [[business-logic/synthetic-fleet-maintenance/downtime-sla-threshold-policy]]
