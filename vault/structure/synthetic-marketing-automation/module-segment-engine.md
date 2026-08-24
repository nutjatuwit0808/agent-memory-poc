---
layer: structure
tags: [segment, module, core]
created: 2025-12-28
links:
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
  - "[[business-logic/synthetic-marketing-automation/segment-freshness-policy]]"
---

# Module: segment-engine

คำนวณสมาชิกของแต่ละ audience segment ตามเงื่อนไขที่ทีม marketing ตั้งไว้ (เช่น "ซื้อในช่วง 30 วันล่าสุด และไม่เคย unsubscribe") แยกออกมาเป็น service อิสระเพราะการคำนวณ segment ขนาดใหญ่ (หลายล้าน contact) ใช้ CPU สูงมากและไม่ควรบล็อก request อื่นของระบบ

## ฟังก์ชันหลัก
- `defineSegment(name: string, rules: SegmentRule[]): Promise<Segment>` — สร้างนิยาม segment ใหม่จากเงื่อนไขที่กำหนด
- `recomputeSegment(segmentId: string): Promise<SegmentSnapshot>` — คำนวณสมาชิกใหม่ทั้งหมดตามเงื่อนไขปัจจุบัน สร้าง snapshot ใหม่
- `getSegmentSnapshot(segmentId: string): Promise<SegmentSnapshot>` — คืน snapshot ล่าสุดที่คำนวณไว้ ไม่คำนวณใหม่ทุกครั้งที่เรียกเพราะแพงเกินไป

## ความสัมพันธ์กับ module อื่น

snapshot แต่ละอันมี `computedAt` timestamp เสมอ — [[structure/synthetic-marketing-automation/module-campaign-builder]] ต้องเช็คว่า snapshot สดพอก่อนใช้งานตาม [[business-logic/synthetic-marketing-automation/segment-freshness-policy]] ไม่ใช่ใช้ snapshot เก่าโดยไม่ตรวจสอบ
