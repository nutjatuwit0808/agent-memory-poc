---
layer: business-logic
tags: [attribution, duplicate, edge-case]
created: 2025-09-19
links:
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
  - "[[business-logic/synthetic-customer-segmentation/attribution-lookback-policy]]"
---

# ข้อยกเว้น: Attribution Double-Count จาก Duplicate Conversion Event

ถ้า conversion event เดียวกันถูก ingest ซ้ำสองครั้งในช่วงเวลาต่างกัน (เช่น webhook ส่งซ้ำ) [[structure/synthetic-customer-segmentation/module-event-ingester]] อาจไม่ catch duplicate ถ้าห่างกันเกิน `EVENT_DEDUP_WINDOW_HOURS` ทำให้ attribution-engine นับ conversion สองครั้ง

กรณีนี้ต้องใช้ `voidAttribution` เพื่อยกเลิก attribution ที่เกิดจาก duplicate event แล้ว recompute ใหม่ — ระบบไม่ detect duplicate ข้าม dedup window อัตโนมัติ ต้องอาศัยทีมที่สังเกตเห็นตัวเลข attribution ผิดปกติ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-customer-segmentation/attribution-lookback-policy]] ("นโยบาย Attribution Lookback Window") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
