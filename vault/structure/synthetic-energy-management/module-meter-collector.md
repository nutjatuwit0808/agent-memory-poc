---
layer: structure
tags: [meter, module, core]
created: 2026-06-26
links:
  - "[[structure/synthetic-energy-management/module-anomaly-detector]]"
  - "[[structure/synthetic-energy-management/module-demand-response-controller]]"
---

# Module: meter-collector

เก็บข้อมูลดิบจาก IoT meter ทุกตัวทั่วอาคาร รองรับ meter หลายพันตัวที่ส่งข้อมูลความถี่สูง เก็บเป็น time-series โดยไม่ aggregate ล่วงหน้าเพื่อให้ service อื่นเลือกวิธี aggregate เองตามความต้องการ แยกออกมาเป็น service อิสระเพราะ throughput สูงกว่า service อื่นในระบบมาก

## ฟังก์ชันหลัก
- `ingestReading(meterId: string, reading: MeterReading): Promise<void>` — รับข้อมูลดิบ 1 จุดจาก meter บันทึกเป็น time-series
- `getReadings(meterId: string, range: TimeRange): Promise<MeterReading[]>` — ดึงข้อมูลดิบในช่วงเวลาที่กำหนด
- `checkMeterHealth(meterId: string): Promise<MeterHealthStatus>` — ตรวจสถานะ meter ว่ายังส่งข้อมูลปกติหรือขาดหายไปนานแค่ไหน

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่ `ingestReading` สำเร็จ publish event `meter.reading_received` ให้ [[structure/synthetic-energy-management/module-anomaly-detector]] และ [[structure/synthetic-energy-management/module-demand-response-controller]] subscribe ต่อได้ — ไม่มี service ไหนอ่านข้อมูลดิบตรงจากฐานข้อมูลนี้โดยไม่ผ่าน event
