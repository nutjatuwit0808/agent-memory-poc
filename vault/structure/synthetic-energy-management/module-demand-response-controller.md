---
layer: structure
tags: [demand-response, module, core]
created: 2026-06-26
links:
  - "[[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy]]"
  - "[[structure/synthetic-energy-management/module-equipment-scheduler]]"
---

# Module: demand-response-controller

ตัดสินใจว่าเมื่อไหร่ต้องลดการใช้ไฟ (load shedding) ตามระดับ demand ปัจจุบันเทียบกับ threshold ที่กำหนด เป็น service เดียวที่ตัดสินใจ demand response ทั้งหมด ไม่มี service อื่นสั่ง load shedding เองโดยตรง เพื่อป้องกันคำสั่งขัดแย้งกันจากหลายแหล่ง

## ฟังก์ชันหลัก
- `evaluateDemand(facilityId: string, currentLoad: number): Promise<DemandDecision>` — ประเมินว่าต้อง trigger demand response หรือไม่ตามระดับ load ปัจจุบัน
- `triggerLoadShedding(facilityId: string, equipmentIds: string[]): Promise<string>` — สั่งลดโหลดอุปกรณ์ที่ระบุ คืน demandEventId
- `resolveDemandEvent(demandEventId: string): Promise<void>` — ยกเลิกสถานะ demand response เมื่อ load กลับสู่ระดับปกติ

## State

normal → threshold_exceeded → load_shedding_active → resolved — ดู [[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy]]

## ความสัมพันธ์กับ module อื่น

ไม่สั่งควบคุมอุปกรณ์ตรง ส่งคำสั่งผ่าน [[structure/synthetic-energy-management/module-equipment-scheduler]] เสมอ เพื่อให้มีจุดเดียวที่ตัดสินใจลำดับความสำคัญเมื่อคำสั่งจากหลายแหล่งขัดแย้งกัน
