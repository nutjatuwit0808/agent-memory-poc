---
layer: structure
tags: [customer-segmentation, segmentiq, architecture, overview]
created: 2025-10-13
links:
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
  - "[[structure/synthetic-customer-segmentation/module-segment-builder]]"
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
  - "[[structure/synthetic-customer-segmentation/module-health-monitor]]"
  - "[[structure/synthetic-customer-segmentation/module-attribution-engine]]"
---

# ภาพรวมสถาปัตยกรรม SegmentIQ — แพลตฟอร์ม Customer Segmentation

SegmentIQ คือแพลตฟอร์ม customer analytics และ segmentation สำหรับทีม marketing สร้าง audience segment จากข้อมูล behavioral data หลายแหล่ง ได้แก่ web events, purchase history, และ support interactions — ทั้งหมดผ่านการ ingest และ normalize ก่อนนำมาใช้ไม่มีการเขียน query ตรงบน production database ของระบบอื่น

SegmentIQ แบ่งออกเป็นหลาย module ย่อยตามหน้าที่ ตั้งแต่การ ingest event, สร้าง segment definition, refresh membership รายวัน ไปจนถึง export segment ไปยัง marketing channel และวัด segment health metrics ทีม marketing ใช้ dashboard เดียวจัดการ segment ทั้งหมดโดยไม่ต้องเขียน SQL เอง

## Module หลัก

- **event-ingester** — รับ behavioral event จากหลาย source ได้แก่ web tracking pixel, purchase webhook ดู [[structure/synthetic-customer-segmentation/module-event-ingester]]
- **segment-builder** — ให้ทีม marketing สร้างและจัดการ segment definition โดยเลือก criteria เช่น event type, frequency, recency, และ attribute ต่างๆ ดู [[structure/synthetic-customer-segmentation/module-segment-builder]]
- **membership-refresher** — คำนวณและอัปเดต segment membership ทุกวันโดย evaluate event data ล่าสุดเทียบกับ s ดู [[structure/synthetic-customer-segmentation/module-membership-refresher]]
- **channel-exporter** — ส่ง segment membership ที่ refresh แล้วออกไปยัง marketing channel ต่างๆ ดู [[structure/synthetic-customer-segmentation/module-channel-exporter]]
- **health-monitor** — คำนวณและติดตาม health score ของแต่ละ segment รายวัน โดยดูจาก metric หลัก ได้แก่ ดู [[structure/synthetic-customer-segmentation/module-health-monitor]]
- **attribution-engine** — คำนวณ attribution ว่า segment ไหนมีส่วนในการ convert customer โดยใช้ lookback wi ดู [[structure/synthetic-customer-segmentation/module-attribution-engine]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-customer-segmentation/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-customer-segmentation/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-customer-segmentation/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-customer-segmentation/database-schema]]
