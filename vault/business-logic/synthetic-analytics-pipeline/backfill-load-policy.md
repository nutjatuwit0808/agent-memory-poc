---
layer: business-logic
tags: [load, backfill, policy]
created: 2025-09-19
links:
  - "[[business-logic/synthetic-analytics-pipeline/backfill-load-policy-edge-cases]]"
---

# นโยบายการโหลดข้อมูลย้อนหลังจำนวนมาก (Backfill)

การ backfill ข้อมูลย้อนหลังจำนวนมาก (เช่น re-process ข้อมูล 6 เดือนย้อนหลังหลังแก้ transform bug) ต้องรันผ่าน stream แยกจาก incremental load ปกติเสมอ จำกัดไม่เกิน `LOAD_MAX_CONCURRENT_STREAMS` stream พร้อมกัน เพื่อไม่ให้แย่ง write capacity ของ warehouse จาก incremental load ที่ธุรกิจใช้งานอยู่ทุกวัน

backfill job มี priority ต่ำกว่า incremental load เสมอในการแย่งใช้ compute ของ warehouse — ถ้า incremental load รอคิวเพราะ backfill กำลังรันอยู่ ระบบจะ pause backfill ชั่วคราวจนกว่า incremental load จะเสร็จก่อนเสมอ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-analytics-pipeline/backfill-load-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
