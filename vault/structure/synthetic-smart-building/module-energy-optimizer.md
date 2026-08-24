---
layer: structure
tags: [energy, module, core]
created: 2025-12-17
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[structure/synthetic-smart-building/service-boundaries]]"
  - "[[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy]]"
---

# Module: energy-optimizer

คำนวณ setpoint ที่ประหยัดพลังงานที่สุดโดยยังรักษา comfort band ไว้ ทำงานเป็น batch job รันทุก 5 นาทีต่อโซน ไม่ใช่ real-time controller — ส่งผลลัพธ์เป็น "คำแนะนำ" ให้ [[structure/synthetic-smart-building/module-hvac-controller]] ตัดสินใจอีกชั้น เพื่อไม่ให้สอง service แย่งกันสั่งฮาร์ดแวร์ตัวเดียวกันโดยตรง ซึ่งเป็นสาเหตุของ oscillation ที่เคยพบจริง

## ฟังก์ชันหลัก
- `computeOptimalSetpoint(zoneId: string, occupancy: OccupancyState): SetpointRecommendation` — คำนวณ setpoint แนะนำจากราคาไฟปัจจุบันและสถานะ occupancy
- `applyDemandResponseCurve(recommendation: SetpointRecommendation, event: DrEvent): SetpointRecommendation` — ปรับคำแนะนำตามสัญญาณ demand response จากการไฟฟ้า
- `publishRecommendation(rec: SetpointRecommendation): Promise<void>` — ส่งคำแนะนำเข้า queue ให้ hvac-controller รับไปพิจารณา

## ความสัมพันธ์กับ module อื่น

ไม่รู้จักสถานะวาล์วหรือ damper จริงเลย (ดู [[structure/synthetic-smart-building/service-boundaries]]) — คำแนะนำที่ส่งไปอาจถูก [[structure/synthetic-smart-building/module-hvac-controller]] ปฏิเสธได้เสมอถ้ามี manual override ดู [[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy]] สำหรับกติกาการชนกันของสองแหล่งควบคุม
