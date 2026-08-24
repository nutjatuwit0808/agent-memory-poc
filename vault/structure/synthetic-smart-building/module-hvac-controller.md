---
layer: structure
tags: [hvac, module, core]
created: 2025-10-16
links:
  - "[[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]]"
  - "[[structure/synthetic-smart-building/module-energy-optimizer]]"
---

# Module: hvac-controller

ควบคุมอุณหภูมิและการไหลเวียนอากาศของแต่ละโซนในอาคาร แยกออกมาจาก legacy PLC ladder-logic script ชุดเดิมเมื่อปลายปี 2024 เพราะทีมต้องการ logic ที่ทดสอบอัตโนมัติได้และเชื่อมต่อ cloud ได้ hvac-controller เป็นผู้ตัดสินใจสุดท้ายเพียงจุดเดียวที่สั่งวาล์วน้ำเย็นและ damper จริง ไม่มี service อื่นสั่งฮาร์ดแวร์ตัวนี้โดยตรง

## ฟังก์ชันหลัก
- `setZoneSetpoint(zoneId: string, tempC: number, source: "auto" | "manual"): Promise<void>` — ตั้ง setpoint ของโซน พร้อม flag แหล่งที่มาเพื่อแยก override ของคนออกจากคำแนะนำอัตโนมัติ
- `readZoneTelemetry(zoneId: string): Promise<ZoneTelemetry>` — ดึงค่าอุณหภูมิ/ความชื้น/ตำแหน่ง damper ล่าสุดที่ cache ไว้
- `resolveDamperPosition(zoneId: string): DamperCommand` — คำนวณตำแหน่ง damper จาก setpoint ปัจจุบันเทียบกับอุณหภูมิจริง
- `reportSensorStale(zoneId: string, lastSeenMs: number): Promise<void>` — แจ้งว่า sensor ของโซนนี้ไม่ส่งค่าอัปเดตนานผิดปกติ

## State

regulating → holding (อยู่ในช่วง deadband) → regulating ใหม่เมื่อหลุด deadband หรือ fault (sensor ค้าง/วาล์วไม่ตอบสนอง) — ดู [[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]] สำหรับเงื่อนไขที่ manual override มีผลเหนือ auto

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-smart-building/module-energy-optimizer]] โดยตรงในเชิง command — รับได้แค่ "คำแนะนำ" ผ่าน event `setpoint.recommended` แล้วตัดสินใจเองว่าจะรับหรือปฏิเสธ ถ้ามี manual override ค้างอยู่จะปฏิเสธคำแนะนำเสมอ เพื่อไม่ให้ automation เขียนทับสิ่งที่คนเพิ่งตั้งเอง
