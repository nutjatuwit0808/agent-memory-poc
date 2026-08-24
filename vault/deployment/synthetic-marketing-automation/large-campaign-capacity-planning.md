---
layer: deployment
tags: [capacity, planning]
created: 2026-07-13
links:
  - "[[support-cases/synthetic-marketing-automation/case-5891]]"
---

# Large Campaign Capacity Planning

ขั้นตอนวางแผนล่วงหน้าสำหรับ campaign ขนาดใหญ่ผิดปกติ เพื่อป้องกันปัญหาแบบ [[support-cases/synthetic-marketing-automation/case-5891]]

## เกณฑ์ที่ต้องวางแผนล่วงหน้า

campaign ที่มีผู้รับเกิน 3 ล้านคนต้องแจ้งทีม platform ล่วงหน้าอย่างน้อย 3 วันทำการ เพื่อประเมินว่าอัตราส่งปัจจุบันเพียงพอต่อกรอบเวลาที่ต้องการหรือไม่ และต้องขอเพิ่ม rate limit จาก ESP ล่วงหน้าหรือไม่

## การประเมิน

คำนวณเวลาที่ต้องใช้จริงจาก `SEND_RATE_LIMIT_PER_MINUTE` เทียบกับขนาด segment แล้วแจ้งทีม marketing ตั้งแต่ตอน validate campaign ถ้าคาดว่าจะไม่เสร็จภายในกรอบเวลาที่ตั้งใจไว้
