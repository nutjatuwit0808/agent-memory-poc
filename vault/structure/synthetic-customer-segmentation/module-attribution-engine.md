---
layer: structure
tags: [attribution, analytics, module]
created: 2026-07-05
links:
  - "[[business-logic/synthetic-customer-segmentation/attribution-lookback-policy]]"
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
---

# Module: attribution-engine

คำนวณ attribution ว่า segment ไหนมีส่วนในการ convert customer โดยใช้ lookback window ที่กำหนดตาม policy ตรวจสอบ duplicate conversion event ก่อนนับเสมอเพื่อป้องกัน double-count ใช้ผลลัพธ์ช่วยทีม marketing ตัดสินใจว่า segment ไหนมีคุณภาพและคุ้มค่าต่อการ maintain

## ฟังก์ชันหลัก
- `computeAttribution(segmentId: string, conversionEventType: string): Promise<AttributionResult>` — คำนวณ attribution ของ segment สำหรับ conversion type ที่ระบุ
- `getAttributionReport(segmentId: string, window: AttributionWindow): Promise<AttributionReport>` — สร้างรายงาน attribution ตาม lookback window ดู [[business-logic/synthetic-customer-segmentation/attribution-lookback-policy]]
- `listConversionEvents(since: string): Promise<ConversionEvent[]>` — คืน conversion event ที่ dedup แล้วในช่วงเวลาที่ระบุ
- `voidAttribution(attributionId: string, reason: string): Promise<void>` — ยกเลิก attribution result ที่พบว่าผิดพลาด เช่น จาก duplicate event ที่ตกหล่น

## ความสัมพันธ์กับ module อื่น

ดึง conversion event จาก [[structure/synthetic-customer-segmentation/module-event-ingester]] และ membership snapshot จาก [[structure/synthetic-customer-segmentation/module-membership-refresher]] เพื่อคำนวณว่า customer ที่ convert อยู่ใน segment ไหน ณ เวลาที่ convert ดู [[business-logic/synthetic-customer-segmentation/attribution-lookback-policy]] สำหรับ lookback window ที่ใช้
