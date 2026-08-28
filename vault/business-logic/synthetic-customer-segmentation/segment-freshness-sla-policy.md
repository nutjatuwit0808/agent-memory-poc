---
layer: business-logic
tags: [freshness, sla, policy]
created: 2025-11-30
links:
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
  - "[[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy-edge-cases]]"
---

# นโยบาย Segment Freshness SLA

membership snapshot ของทุก segment ต้องถูก refresh ให้เสร็จภายใน 26 ชั่วโมงหลังจาก refresh ครั้งก่อนหน้า — เกินนี้ถือว่า stale และ [[structure/synthetic-customer-segmentation/module-channel-exporter]] จะ refuse export จนกว่า refresh ใหม่จะเสร็จ

SLA 26 ชั่วโมง (ไม่ใช่ 24 ชั่วโมงตรงๆ) เพื่อให้มี buffer ในกรณีที่ refresh job ช้ากว่าปกติเล็กน้อย โดยไม่ทำให้การ export รอบเช้าถูก block

## เหตุผลที่ refuse export แทนที่จะส่งข้อมูลเก่า

การส่ง membership เก่าไปยัง paid ads channel ทำให้เสียงบประมาณกับ audience ที่ไม่ตรงอีกต่อไป — ต้นทุนของการ miss export รอบหนึ่งต่ำกว่าต้นทุนของการส่ง campaign ไปผิดกลุ่มมาก

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
