---
layer: structure
tags: [measurement, module, core]
created: 2026-02-28
links:
  - "[[business-logic/synthetic-quality-control/calibration-interval-policy]]"
  - "[[structure/synthetic-quality-control/module-spc-analyzer]]"
---

# Module: measurement-collector

รับผิดชอบรับข้อมูลวัดจากเซ็นเซอร์บนสายการผลิตและบันทึกลง database โดยตรวจสอบ instrument_id และสถานะ calibration ก่อนรับข้อมูลทุกครั้ง แยกออกมาเป็น service เดียวกันเพราะการ ingest ข้อมูลความถี่สูงต้องการ tuning แยกจาก service ที่ประมวลผลข้อมูล

## ฟังก์ชันหลัก
- `ingestMeasurement(instrumentId: string, runId: string, value: number, unit: string): Promise<MeasurementId>` — รับข้อมูลวัดจากเซ็นเซอร์ ตรวจ calibration status ก่อนบันทึก
- `getCalibrationStatus(instrumentId: string): CalibrationStatus` — คืนสถานะ calibration ล่าสุดของเครื่องมือวัดตัวนั้น
- `listMeasurementsForRun(runId: string, limit?: number): Promise<Measurement[]>` — ดึงข้อมูลวัดทั้งหมดของ production run ที่ระบุ
- `flagInstrumentOverdue(instrumentId: string): Promise<void>` — mark เครื่องมือว่า calibration เกินกำหนด หยุดรับข้อมูลจากตัวนั้นชั่วคราว

## State

instrument: active → overdue (calibration เลยกำหนด) | suspended (ระงับด้วยมือ) | retired — ดู [[business-logic/synthetic-quality-control/calibration-interval-policy]] สำหรับเกณฑ์การ flag

## ความสัมพันธ์กับ module อื่น

ไม่รู้จัก concept SPC เลย — ถ้า [[structure/synthetic-quality-control/module-spc-analyzer]] ต้องการข้อมูลวัดล่าสุดสำหรับคำนวณ control limit ต้องเรียก API ของ measurement-collector ตรงๆ ไม่มีการ push ข้อมูลไปหา spc-analyzer โดยอัตโนมัติ
