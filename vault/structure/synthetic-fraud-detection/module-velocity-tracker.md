---
layer: structure
tags: [velocity, tracking, module]
created: 2025-10-09
links:
  - "[[business-logic/synthetic-fraud-detection/velocity-window-config-policy]]"
---

# Module: velocity-tracker

นับความถี่ (velocity) ของ event ตาม dimension ต่างๆ เช่น จำนวน login attempt ต่อ IP ใน 5 นาที, จำนวน promo redemption ต่อ account ใน 1 ชั่วโมง, หรือจำนวน account สมัครจาก email domain เดียวกันใน 1 วัน counter เหล่านี้เป็น feature สำคัญที่ทั้ง rule-engine และ ml-scorer ใช้

## ฟังก์ชันหลัก
- `increment(dimension: string, key: string, windowSec: number): Promise<number>` — เพิ่ม counter สำหรับ dimension/key และคืนค่าปัจจุบัน — atomic operation
- `getCount(dimension: string, key: string, windowSec: number): Promise<number>` — อ่าน counter ปัจจุบันโดยไม่เพิ่มค่า
- `configureWindow(dimension: string, windowSec: number): Promise<void>` — ตั้งค่า time window ของ dimension ตาม [[business-logic/synthetic-fraud-detection/velocity-window-config-policy]]

## ความสัมพันธ์กับ module อื่น

ใช้ sliding window algorithm ใน Redis เพื่อให้ counter decay ตามเวลาจริงแทนการ reset เป็นศูนย์ทุก interval — ป้องกัน burst attack ที่จัดเวลาให้พอดีกับจุดที่ counter รีเซ็ต ดู [[business-logic/synthetic-fraud-detection/velocity-window-config-policy]] สำหรับ window ที่ใช้แต่ละ dimension
