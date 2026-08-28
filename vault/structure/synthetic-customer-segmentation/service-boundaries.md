---
layer: structure
tags: [customer-segmentation, segmentiq, boundaries]
created: 2026-03-19
links:
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
  - "[[structure/synthetic-customer-segmentation/module-segment-builder]]"
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
---

# Service Boundaries

แต่ละ module มีฐานข้อมูลของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-customer-segmentation/module-event-ingester]] เป็นเจ้าของ raw event store ส่วน [[structure/synthetic-customer-segmentation/module-segment-builder]] เป็นเจ้าของ segment definition และ membership snapshot ทั้งสองไม่ share ตารางกันโดยตรง

[[structure/synthetic-customer-segmentation/module-membership-refresher]] เป็น module เดียวที่ query ทั้ง event store ของ [[structure/synthetic-customer-segmentation/module-event-ingester]] และ segment definition ของ [[structure/synthetic-customer-segmentation/module-segment-builder]] พร้อมกันได้ — เป็นข้อยกเว้นที่ตั้งใจเพราะการคำนวณ membership ต้องเห็นทั้งสองพร้อมกันเพื่อไม่ให้ใช้ event snapshot คนละช่วงเวลา
