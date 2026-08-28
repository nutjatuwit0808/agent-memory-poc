---
layer: business-logic
tags: [assignment, policy]
created: 2026-05-26
links:
  - "[[structure/synthetic-asset-management/module-assignment-tracker]]"
---

# นโยบายการมอบหมายสินทรัพย์ให้พนักงาน

พนักงานแต่ละคนมีโควต้าสูงสุดของสินทรัพย์ที่สามารถถืออยู่พร้อมกันตาม job grade — ยกเว้นอุปกรณ์ที่ได้รับอนุมัติเฉพาะเพื่องานพิเศษ ซึ่งไม่นับในโควต้านี้

การ assign สินทรัพย์ให้พนักงานที่ลาออกหรือถูก terminate แล้วจะถูก block โดยอัตโนมัติ [[structure/synthetic-asset-management/module-assignment-tracker]] ตรวจสอบสถานะพนักงานจาก HR system ก่อนทุก assign
