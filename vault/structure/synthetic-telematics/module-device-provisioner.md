---
layer: structure
tags: [device, module]
created: 2026-01-10
links:
  - "[[business-logic/synthetic-telematics/device-heartbeat-timeout-policy]]"
---

# Module: device-provisioner

จัดการการติดตั้งและเชื่อมโยงอุปกรณ์ OBD-II กับกรมธรรม์ประกันภัย ตรวจสอบสถานะ heartbeat ของอุปกรณ์ว่ายังทำงานปกติหรือขาดการเชื่อมต่อ แยกออกมาเป็น service อิสระเพราะกระบวนการติดตั้งอุปกรณ์ทางกายภาพมีขั้นตอนต่างจาก service ที่ประมวลผลข้อมูลล้วนๆ

## ฟังก์ชันหลัก
- `provisionDevice(deviceId: string, policyholderId: string): Promise<void>` — เชื่อมโยงอุปกรณ์กับกรมธรรม์ เริ่มสถานะ pending
- `confirmActivation(deviceId: string): Promise<void>` — ยืนยันว่าอุปกรณ์เริ่มส่งข้อมูลจริงแล้ว เปลี่ยนสถานะเป็น active
- `checkHeartbeat(deviceId: string): Promise<DeviceStatus>` — ตรวจสถานะการเชื่อมต่อล่าสุดของอุปกรณ์

## State

pending → active → inactive (heartbeat timeout) — ดู [[business-logic/synthetic-telematics/device-heartbeat-timeout-policy]]

## ความสัมพันธ์กับ module อื่น

ถ้าอุปกรณ์ไม่ active ภายในเวลาที่กำหนดหลัง provision จะแจ้งเตือนทีมสนับสนุนให้ติดต่อผู้ขับตรวจสอบการติดตั้ง
