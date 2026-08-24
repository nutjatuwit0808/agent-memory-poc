---
layer: deployment
tags: [capacity, seasonal, runbook]
created: 2026-01-25
links:
  - "[[structure/synthetic-recruitment-ats/module-resume-parser]]"
---

# Hiring Surge Capacity Runbook

ขั้นตอนเตรียมความพร้อมสำหรับ hiring surge window ที่มี requisition เปิดพร้อมกันจำนวนมากหลังงบประมาณไตรมาสใหม่อนุมัติ

## ก่อนเข้าช่วง surge

ปรับ min replica ของ [[structure/synthetic-recruitment-ats/module-resume-parser]] ขึ้นล่วงหน้าอย่างน้อย 3 วันก่อนเข้าช่วง hiring surge window ที่คาดการณ์ไว้ ไม่รอให้ queue depth พุ่งก่อนแล้วค่อย scale ตาม threshold ปกติ

## ระหว่าง surge

เฝ้าดู `PARSER_LOW_CONFIDENCE_THRESHOLD` hit rate เป็นพิเศษ เพราะปริมาณ resume ที่หลากหลายขึ้นช่วง surge มักทำให้สัดส่วนที่ต้องส่งคนตรวจเพิ่มขึ้นตามไปด้วย ต้องเตรียมกำลังคน recruiter รองรับล่วงหน้าเช่นกัน
