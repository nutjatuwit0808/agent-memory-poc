---
layer: structure
tags: [scheduling, module]
created: 2025-10-02
links:
  - "[[structure/synthetic-energy-management/module-demand-response-controller]]"
  - "[[business-logic/synthetic-energy-management/equipment-minimum-off-time-policy]]"
---

# Module: equipment-scheduler

จัดตารางเปิด-ปิดอุปกรณ์อัตโนมัติตามเงื่อนไขที่กำหนด (เวลา, demand response, การบำรุงรักษา) เป็นจุดเดียวที่ตัดสินใจลำดับความสำคัญเมื่อมีคำสั่งขัดแย้งกันจากหลายแหล่ง เช่น demand response สั่งปิดพร้อมกับตารางบำรุงรักษาสั่งเปิด

## ฟังก์ชันหลัก
- `scheduleEquipment(equipmentId: string, action: "on" | "off", at: string): Promise<string>` — กำหนดตารางเปิด/ปิดอุปกรณ์ล่วงหน้า
- `resolveConflict(equipmentId: string, requests: ScheduleRequest[]): Promise<ScheduleRequest>` — ตัดสินใจคำสั่งไหนชนะเมื่อมีคำสั่งขัดแย้งกันสำหรับอุปกรณ์เดียวกัน
- `getScheduleStatus(equipmentId: string): Promise<EquipmentStatus>` — คืนสถานะตารางปัจจุบันของอุปกรณ์

## ความสัมพันธ์กับ module อื่น

รับคำสั่งจาก [[structure/synthetic-energy-management/module-demand-response-controller]] และจากตารางบำรุงรักษาปกติพร้อมกันได้ — ดู [[business-logic/synthetic-energy-management/equipment-minimum-off-time-policy]] สำหรับข้อจำกัดการเปิด-ปิดถี่เกินไป
