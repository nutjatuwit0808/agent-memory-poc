---
layer: structure
tags: [export, channel, module]
created: 2026-01-02
links:
  - "[[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]]"
---

# Module: channel-exporter

ส่ง segment membership ที่ refresh แล้วออกไปยัง marketing channel ต่างๆ เช่น email platform, paid ads, และ push notification service ตาม schedule ที่กำหนดไว้ต่อ channel ทำหน้าที่เป็น adapter ระหว่าง SegmentIQ กับ external channel ทั้งหมด แยกออกมาเพราะแต่ละ channel มี API และ rate limit ที่ต่างกัน

## ฟังก์ชันหลัก
- `exportSegment(segmentId: string, channelId: string): Promise<ExportResult>` — ส่ง membership snapshot ล่าสุดไปยัง channel ที่ระบุ ตรวจ freshness ก่อนส่งเสมอ
- `listChannelConfigs(): Promise<ChannelConfig[]>` — คืนรายการ channel ทั้งหมดพร้อม config ปัจจุบัน ไม่รวม credential ดิบ
- `getExportHistory(segmentId: string, limit: number): Promise<ExportLog[]>` — ดึงประวัติ export ของ segment พร้อม status ของแต่ละครั้ง
- `retryFailedExport(exportId: string): Promise<ExportResult>` — ลอง export ซ้ำสำหรับรายการที่ล้มเหลว ดู [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]

## ความสัมพันธ์กับ module อื่น

ตรวจสอบ freshness ของ membership snapshot ก่อนส่งทุกครั้ง — ถ้า snapshot เก่าเกินเกณฑ์ใน [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]] จะ refuse export และแจ้ง error แทนที่จะส่งข้อมูลเก่าออกไป
