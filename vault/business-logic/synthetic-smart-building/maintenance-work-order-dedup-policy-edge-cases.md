---
layer: business-logic
tags: [maintenance, dedup, edge-case]
created: 2026-04-05
links:
  - "[[business-logic/synthetic-smart-building/maintenance-work-order-dedup-policy]]"
---

# ข้อยกเว้นเมื่อ Fault เดิมเกิดซ้ำหลังปิดงานไปแล้วไม่นาน

ถ้า work order ถูกปิด (`closed`) ไปแล้วแต่ fault event ประเภทเดียวกันกลับมาอีกภายใน 24 ชั่วโมง ระบบจะไม่สร้าง work order ใหม่ตาม flow ปกติ — จะเรียก `reopenWorkOrder` บนใบเดิมแทน เพื่อให้ประวัติการซ่อมอยู่ในใบเดียวกันต่อเนื่อง ช่วยให้ช่างเห็นว่าการแก้ไขครั้งก่อนอาจไม่ได้แก้ที่ต้นเหตุจริง

เกิน 24 ชั่วโมงไปแล้วจึงจะถือเป็น fault ใหม่และสร้างใบใหม่ตามปกติ เพราะการซ่อมที่ได้ผลจริงมักจะเห็นผลตั้งแต่วันแรก ถ้าผ่านไปหลายวันแล้วเพิ่งเกิดซ้ำมักเป็นสาเหตุอื่นมากกว่า

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-smart-building/maintenance-work-order-dedup-policy]] ("นโยบายกันสร้าง Work Order ซ้ำ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
