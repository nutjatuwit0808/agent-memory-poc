---
layer: deployment
tags: [index, performance, runbook]
created: 2025-09-20
---

# Segment Index Rebuild Runbook

## เมื่อไหร่ต้อง rebuild

เมื่อ `previewSegmentSize` ช้าลงอย่างมีนัยสำคัญ หรือหลังจาก event table มีการ partition เพิ่มหรือ reorganize ขนาดใหญ่

## ขั้นตอน

1) ตรวจ slow query log เพื่อยืนยันว่าปัญหาเป็น index ไม่ใช่ query logic 2) rebuild index ในช่วง off-peak (ตี 3-5 วันทำการ) 3) verify ด้วย benchmark query สำหรับ segment rule pattern ที่ใช้บ่อย 4) document index ที่เพิ่มหรือแก้ใน deployment note
