---
layer: structure
tags: [accident, module, core]
created: 2026-07-25
links:
  - "[[business-logic/synthetic-telematics/accident-evidence-retention-policy]]"
---

# Module: accident-detector

ตรวจจับสัญญาณที่บ่งชี้ว่าอาจเกิดอุบัติเหตุแบบ real-time จากรูปแบบความเร่ง/การหยุดกะทันหัน แจ้งเตือนทีมช่วยเหลือฉุกเฉินและเก็บหลักฐานสำหรับการเคลมประกันในอนาคต ต้องทำงานแบบ real-time เพราะการช่วยเหลือที่ล่าช้าอาจมีผลต่อความปลอดภัยของผู้ขับจริง

## ฟังก์ชันหลัก
- `evaluateHarshEvent(event: HarshEvent): Promise<AccidentAssessment>` — ประเมินว่าเหตุการณ์ความเร่งผิดปกติมีแนวโน้มเป็นอุบัติเหตุจริงหรือไม่
- `raiseAccidentAlert(tripId: string, evidence: AccidentEvidence): Promise<string>` — แจ้งเตือนทีมช่วยเหลือฉุกเฉิน คืน alertId
- `retainEvidence(alertId: string): Promise<void>` — เก็บหลักฐาน (GPS trace ช่วงเกิดเหตุ, sensor data) ไว้สำหรับการเคลมประกัน

## ความสัมพันธ์กับ module อื่น

ดู [[business-logic/synthetic-telematics/accident-evidence-retention-policy]] สำหรับระยะเวลาเก็บหลักฐาน — หลักฐานนี้อาจถูกใช้อ้างอิงในกระบวนการเคลมที่เกิดขึ้นหลายเดือนหลังเหตุการณ์จริง
