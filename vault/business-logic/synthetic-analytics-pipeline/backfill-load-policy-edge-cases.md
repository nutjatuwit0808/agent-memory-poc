---
layer: business-logic
tags: [load, edge-case]
created: 2026-04-16
links:
  - "[[business-logic/synthetic-analytics-pipeline/backfill-load-policy]]"
---

# ข้อยกเว้นสำหรับ Backfill ที่มี Deadline ทางธุรกิจ

ถ้า backfill มี deadline ทางธุรกิจชัดเจน (เช่น ต้องแก้ตัวเลขให้ทันก่อนปิดรอบบัญชีรายไตรมาส) ทีมสามารถขอ priority override ชั่วคราวให้ backfill แย่ง capacity ได้เท่ากับ incremental load แทนที่จะต่ำกว่าเสมอ แต่ต้องแจ้งทีมที่ใช้ dashboard แบบเรียลไทม์ล่วงหน้าเสมอว่าข้อมูลอาจ delay ชั่วคราว

ไม่ว่า override priority หรือไม่ จำนวน stream สูงสุดยังคงถูกจำกัดที่ `LOAD_MAX_CONCURRENT_STREAMS` เสมอ ไม่มีข้อยกเว้นให้ backfill ใช้ stream เกินเพดานนี้ เพราะเป็นข้อจำกัดทางกายภาพของ warehouse connection pool ไม่ใช่แค่เรื่อง priority

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-analytics-pipeline/backfill-load-policy]] ("นโยบายการโหลดข้อมูลย้อนหลังจำนวนมาก (Backfill)") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
