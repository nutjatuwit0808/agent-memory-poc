---
layer: business-logic
tags: [attribution, analytics, policy]
created: 2026-02-23
links:
  - "[[structure/synthetic-customer-segmentation/module-attribution-engine]]"
  - "[[business-logic/synthetic-customer-segmentation/attribution-lookback-policy-edge-cases]]"
---

# นโยบาย Attribution Lookback Window

[[structure/synthetic-customer-segmentation/module-attribution-engine]] ใช้ lookback window 30 วัน เป็น default สำหรับ first-touch attribution — หมายความว่า conversion จะถูก attribute ไปยัง segment ที่ customer เป็น member อยู่ตอนที่ touchpoint แรกเกิดขึ้น ไม่ใช่ตอน convert

window ที่ยาวกว่า 30 วัน ต้องมีการอนุมัติจาก data analytics lead เพราะทำให้ attribution ซ้อนทับกันระหว่าง campaign ได้ง่ายขึ้นและยากต่อการ interpret

## ทำไมต้อง cap lookback ที่ 30 วัน

lookback ที่ยาวเกินไปทำให้ segment ที่ customer เคยอยู่เมื่อนานมาแล้วได้รับ credit จากการ convert ในปัจจุบัน ทั้งที่อาจไม่ใช่ segment ที่ drive conversion จริง — 30 วันเป็น consensus ของทีมว่าเป็น window ที่สมเหตุสมผลสำหรับธุรกิจประเภทนี้

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-customer-segmentation/attribution-lookback-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
