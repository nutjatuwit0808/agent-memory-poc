---
layer: business-logic
tags: [segment-size, export, policy]
created: 2026-07-24
links:
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
  - "[[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy-edge-cases]]"
---

# นโยบาย Minimum Segment Size ก่อน Export

segment ที่มี membership น้อยกว่า `MIN_SEGMENT_SIZE_FOR_EXPORT` จะไม่ถูก export ไปยัง marketing channel — เพื่อป้องกัน fingerprinting ของ customer ในกลุ่มเล็กมากจาก pattern การ target ที่ specific เกินไป

[[structure/synthetic-customer-segmentation/module-channel-exporter]] ตรวจสอบขนาดก่อน export ทุกครั้ง ไม่ใช่แค่ตอนที่ marketing สร้าง segment เพราะขนาด segment เปลี่ยนได้ทุกวันหลัง membership refresh

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
