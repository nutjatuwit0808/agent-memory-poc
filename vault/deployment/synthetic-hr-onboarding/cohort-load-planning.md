---
layer: deployment
tags: [cohort, capacity]
created: 2026-03-22
links:
  - "[[business-logic/synthetic-hr-onboarding/cohort-scheduling-policy]]"
  - "[[support-cases/synthetic-hr-onboarding/case-1394]]"
---

# Cohort Load Planning

ขั้นตอนวางแผนกำลังของทั้งระบบ (software + คน + อุปกรณ์) ก่อนแต่ละรอบ cohort ตาม [[business-logic/synthetic-hr-onboarding/cohort-scheduling-policy]]

## เช็คลิสต์ก่อน cohort

เช็คจำนวน case ที่จะเริ่มพร้อมกัน เทียบกับ inventory laptop คงเหลือ, กำลังคนของทีม IT ที่พร้อมประมวลผล ticket, และจำนวน buddy ที่ยังรับเพิ่มได้ ก่อนอนุมัติ cohort อย่างเป็นทางการ

## cohort ขนาดใหญ่ผิดปกติ

cohort ที่มีจำนวนพนักงานใหม่เกิน 20 คนต้องแจ้งทีม platform ล่วงหน้าอย่างน้อย 1 สัปดาห์ เพื่อเตรียม stagger การสร้าง task และเช็ค connection pool ตามบทเรียนจาก [[support-cases/synthetic-hr-onboarding/case-1394]]
