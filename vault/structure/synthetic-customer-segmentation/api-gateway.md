---
layer: structure
tags: [customer-segmentation, segmentiq, gateway, api]
created: 2026-02-18
links:
  - "[[structure/synthetic-customer-segmentation/module-segment-builder]]"
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
---

# API Gateway

คำขอจากทีม marketing ผ่าน self-service portal เข้ามาทาง REST API gateway กลาง ซึ่งตรวจสอบ auth และ authorization ว่า user มีสิทธิ์เข้าถึง segment ที่ขอหรือไม่ก่อนส่งต่อให้ [[structure/synthetic-customer-segmentation/module-segment-builder]]

การ export segment ไปยัง marketing channel ไม่ได้เกิดจาก user trigger โดยตรง — [[structure/synthetic-customer-segmentation/module-channel-exporter]] ทำงานตาม schedule ที่กำหนดไว้ล่วงหน้า และอ่าน segment membership ล่าสุดจาก [[structure/synthetic-customer-segmentation/module-membership-refresher]] ก่อน export ทุกครั้ง
