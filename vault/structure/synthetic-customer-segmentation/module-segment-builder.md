---
layer: structure
tags: [segmentation, module, core]
created: 2026-06-11
links:
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
  - "[[business-logic/synthetic-customer-segmentation/segment-archival-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]]"
---

# Module: segment-builder

ให้ทีม marketing สร้างและจัดการ segment definition โดยเลือก criteria เช่น event type, frequency, recency, และ attribute ต่างๆ — segment definition ถูก store เป็น structured rule ที่ [[structure/synthetic-customer-segmentation/module-membership-refresher]] จะ evaluate เพื่อคำนวณว่า customer คนไหนอยู่ใน segment ไหน แยกออกมาจาก membership refresher เพราะ definition ไม่ค่อยเปลี่ยน แต่ membership เปลี่ยนรายวัน

## ฟังก์ชันหลัก
- `createSegment(definition: SegmentDefinition, createdBy: string): Promise<Segment>` — สร้าง segment ใหม่ validate rule syntax และ publish event ให้ refresher
- `updateSegment(segmentId: string, definition: SegmentDefinition, updatedBy: string): Promise<void>` — แก้ definition ของ segment ที่มีอยู่ trigger refresh อัตโนมัติ
- `previewSegmentSize(definition: SegmentDefinition): Promise<number>` — ประมาณขนาด segment จาก event snapshot โดยไม่ commit definition ให้ใช้ก่อน save จริง
- `archiveSegment(segmentId: string, archivedBy: string): Promise<void>` — archive segment ที่ไม่ใช้แล้ว ดู [[business-logic/synthetic-customer-segmentation/segment-archival-policy]]

## State

draft → active → paused | archived — ดู [[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy]] สำหรับเงื่อนไขก่อน active segment ที่เพิ่งสร้าง

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่ segment definition เปลี่ยน จะ publish event `segment.definition_updated` ให้ [[structure/synthetic-customer-segmentation/module-membership-refresher]] trigger refresh ทันที — ดู [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]] สำหรับ SLA ว่า refresh ต้องเสร็จภายในเท่าไหร่หลัง definition เปลี่ยน
