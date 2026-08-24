---
layer: structure
tags: [fleet, module, core]
created: 2026-07-04
links:
  - "[[business-logic/synthetic-warehouse-robotics/robot-decommission-policy]]"
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
---

# Module: fleet-controller

เจ้าของสถานะหุ่นยนต์ทุกตัวในคลัง (ตำแหน่ง, แบตเตอรี่, สถานะ fault, สถานะออนไลน์/ออฟไลน์) ทุก service อื่นที่ต้องรู้ว่าหุ่นยนต์ตัวไหน "ว่าง" ต้อง query ผ่านตัวนี้เท่านั้น ไม่มี service ไหนเก็บ state หุ่นยนต์ซ้ำเอง

## ฟังก์ชันหลัก
- `getAvailableRobots(zoneId: string): Promise<Robot[]>` — คืนรายการหุ่นยนต์ที่ว่างและอยู่ในโซนที่ระบุ
- `recordHeartbeat(robotId: string, telemetry: Telemetry): Promise<void>` — บันทึก heartbeat ที่หุ่นยนต์ส่งเข้ามาทุก 2 วินาที
- `markRobotFault(robotId: string, faultCode: string): Promise<void>` — เปลี่ยนสถานะหุ่นยนต์เป็น fault และหยุดจ่ายงานใหม่ให้ตัวนั้นทันที
- `decommissionRobot(robotId: string, reason: string): Promise<void>` — ปลดระวางหุ่นยนต์ถาวร ดู [[business-logic/synthetic-warehouse-robotics/robot-decommission-policy]]

## State

idle → assigned → moving → picking → returning → idle หรือ fault (จาก state ไหนก็ได้ถ้า heartbeat ขาดหายเกิน threshold)

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-warehouse-robotics/module-task-scheduler]] เรียก `getAvailableRobots` ทุกครั้งก่อนมอบหมายงาน แต่ fleet-controller ไม่รู้จัก concept ของ "order" หรือ "pick task" เลย — รู้แค่ว่าหุ่นยนต์ตัวไหน busy หรือว่าง เป็นการตัดสินใจ assignment ทั้งหมดอยู่ที่ task-scheduler
