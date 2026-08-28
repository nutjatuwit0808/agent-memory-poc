---
layer: structure
tags: [health, monitoring, module]
created: 2026-04-30
links:
  - "[[business-logic/synthetic-customer-segmentation/health-score-threshold-policy]]"
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
---

# Module: health-monitor

คำนวณและติดตาม health score ของแต่ละ segment รายวัน โดยดูจาก metric หลัก ได้แก่ ขนาด segment, อัตราการเปลี่ยนแปลง membership, ความ freshness ของ event data ที่ใช้ และ export success rate — แจ้งเตือนทีม marketing เมื่อ segment มีสัญญาณว่าคุณภาพลดลงก่อนที่จะกระทบผลลัพธ์ campaign

## ฟังก์ชันหลัก
- `computeHealthScore(segmentId: string, asOf: string): Promise<HealthScore>` — คำนวณ health score ใหม่สำหรับ segment โดยรวม metric ทุกด้าน
- `getHealthHistory(segmentId: string, days: number): Promise<HealthScore[]>` — ดึงประวัติ health score เพื่อดู trend
- `listDegradedSegments(threshold: number): Promise<Segment[]>` — คืนรายการ segment ที่ health score ต่ำกว่า threshold ดู [[business-logic/synthetic-customer-segmentation/health-score-threshold-policy]]
- `acknowledgeAlert(segmentId: string, acknowledgedBy: string): Promise<void>` — ยืนยันว่าทีมรับรู้ alert แล้วเพื่อหยุด escalate

## ความสัมพันธ์กับ module อื่น

subscribe `membership.refresh_completed` จาก [[structure/synthetic-customer-segmentation/module-membership-refresher]] เพื่อ trigger `computeHealthScore` อัตโนมัติหลัง refresh เสร็จทุกครั้ง ดู [[business-logic/synthetic-customer-segmentation/health-score-threshold-policy]] สำหรับเกณฑ์ที่ trigger alert
