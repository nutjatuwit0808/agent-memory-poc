---
layer: structure
tags: [anomaly, module, core]
created: 2026-02-15
links:
  - "[[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy]]"
---

# Module: anomaly-detector

ตรวจจับความผิดปกติของข้อมูลการใช้พลังงานแบบ real-time เช่น การใช้ไฟพุ่งสูงผิดปกติกลางดึกที่ไม่ควรมีคนทำงาน หรือ meter ค่าติดลบที่เป็นไปไม่ได้ทางกายภาพ แยกออกมาจาก meter-collector เพราะ logic การตรวจจับซับซ้อนและเปลี่ยนแปลงบ่อยกว่าการเก็บข้อมูลดิบมาก

## ฟังก์ชันหลัก
- `evaluateReading(reading: MeterReading, baseline: BaselineProfile): Promise<AnomalyResult>` — ประเมินว่าค่าที่อ่านได้ผิดปกติจาก baseline หรือไม่
- `raiseAlert(meterId: string, anomalyType: string): Promise<void>` — แจ้งเตือนทีมอาคารเมื่อพบความผิดปกติ
- `updateBaseline(meterId: string, window: TimeRange): Promise<BaselineProfile>` — คำนวณ baseline ใหม่จากข้อมูลย้อนหลัง

## ความสัมพันธ์กับ module อื่น

ใช้ baseline ที่คำนวณจากข้อมูลย้อนหลัง 30 วันเป็นค่าเปรียบเทียบ ไม่ใช้ threshold ตายตัวเพราะรูปแบบการใช้พลังงานต่างกันมากระหว่างวันธรรมดา/วันหยุด/ฤดูกาล ดู [[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy]]
