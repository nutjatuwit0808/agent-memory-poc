---
layer: structure
tags: [access-control, module, core]
created: 2026-01-08
links:
  - "[[structure/synthetic-smart-building/api-gateway]]"
  - "[[business-logic/synthetic-smart-building/access-control-lockout-policy]]"
---

# Module: access-control-gateway

ควบคุมประตูและบัตรผ่านของอาคาร เชื่อมกับ door controller ฮาร์ดแวร์ผ่าน RS-485 bus ในแต่ละชั้น แยก schedule ที่กำหนดไว้ล่วงหน้า (เช่น fire drill, holiday lockdown) เก็บเป็นตารางต่างหากจาก access rule ปกติ เพื่อให้ตรวจสอบและแก้ schedule ได้โดยไม่กระทบ logic การอนุญาตเข้าออกประจำวัน

## ฟังก์ชันหลัก
- `evaluateBadgeSwipe(badgeId: string, doorId: string): Promise<AccessResult>` — ตรวจสิทธิ์บัตรกับประตูที่ปัดจริง คืนผล allow/deny พร้อมเหตุผล
- `scheduleDoorState(doorId: string, state: DoorScheduleState, window: TimeWindow): Promise<void>` — ตั้งตารางสถานะประตูล่วงหน้า เช่น unlock ช่วงเวลาทำการ
- `overrideDoorState(doorId: string, state: "unlocked" | "locked", reason: string): Promise<void>` — สั่ง override สถานะประตูทันทีนอกเหนือ schedule ปกติ

## State

locked → unlocked (ตาม schedule หรือ badge ถูกต้อง) → locked เมื่อพ้น pulse window เสมอ เว้นแต่มี override ค้างอยู่

## ความสัมพันธ์กับ module อื่น

รับสัญญาณ fire panel ผ่านสาย hardwired แยกจาก API gateway กลาง (ดู [[structure/synthetic-smart-building/api-gateway]]) เพื่อให้ปลดล็อกทุกประตูได้ทันทีโดยไม่พึ่ง network — ดู [[business-logic/synthetic-smart-building/access-control-lockout-policy]] สำหรับกติกาการชนกันของ schedule กับเหตุฉุกเฉิน
