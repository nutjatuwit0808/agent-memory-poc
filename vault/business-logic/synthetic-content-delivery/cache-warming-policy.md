---
layer: business-logic
tags: [cache, warming, policy]
created: 2026-03-16
links:
  - "[[support-cases/synthetic-content-delivery/case-9956]]"
---

# นโยบาย Cache Warming สำหรับ Content ที่คาดว่าจะมี Traffic สูง

Tenant ที่รู้ล่วงหน้าว่าจะมี traffic spike เช่น รายการถ่ายทอดสด หรือ content ที่โฆษณาไว้แล้ว สามารถ request cache warming ล่วงหน้าได้อย่างน้อย 1 ชั่วโมงก่อน event เพื่อให้ EdgeServe ดึงเนื้อหามาเก็บไว้ที่ edge node ล่วงหน้า

Cache warming ดึงเนื้อหาจาก origin นอก critical path — ไม่มี user รอ ทำให้ origin ไม่ถูก flood ในเวลาเดียวกับที่ traffic ผู้ใช้เพิ่มขึ้น ดู [[support-cases/synthetic-content-delivery/case-9956]] สำหรับกรณีที่ไม่มีการ warm cache ล่วงหน้า
