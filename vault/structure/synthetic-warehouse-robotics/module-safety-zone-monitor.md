---
layer: structure
tags: [safety, module]
created: 2026-07-24
links:
  - "[[structure/synthetic-warehouse-robotics/api-gateway]]"
  - "[[business-logic/synthetic-warehouse-robotics/safety-zone-violation-policy]]"
---

# Module: safety-zone-monitor

เฝ้าระวังโซนที่มนุษย์และหุ่นยนต์ทำงานร่วมกัน ใช้ข้อมูลจากเซ็นเซอร์ LiDAR ติดผนังร่วมกับกล้อง เป็น service เดียวที่มีสิทธิ์สั่ง emergency stop หุ่นยนต์ได้โดยไม่ต้องผ่าน fleet-controller เพื่อลด latency ของคำสั่งหยุดฉุกเฉิน

## ฟังก์ชันหลัก
- `evaluateZoneOccupancy(zoneId: string): ZoneStatus` — ประเมินว่ามีคนอยู่ในโซนที่หุ่นยนต์กำลังทำงานหรือไม่
- `triggerEmergencyStop(zoneId: string, reason: string): Promise<void>` — สั่งหยุดหุ่นยนต์ทุกตัวในโซนทันที (bypass queue ปกติ)
- `clearZoneAlert(zoneId: string, clearedBy: string): Promise<void>` — ปลดล็อกโซนหลังตรวจสอบแล้วว่าปลอดภัย ต้องมีคนยืนยันเสมอ

## ความสัมพันธ์กับ module อื่น

คำสั่ง emergency stop ไม่ผ่าน API gateway กลาง (ดู [[structure/synthetic-warehouse-robotics/api-gateway]]) เพราะ latency เฉลี่ยของ gateway ช้าเกินไปสำหรับสถานการณ์ที่ต้องหยุดภายในเสี้ยววินาที ดู [[business-logic/synthetic-warehouse-robotics/safety-zone-violation-policy]]
