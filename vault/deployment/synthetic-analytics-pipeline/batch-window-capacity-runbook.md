---
layer: deployment
tags: [capacity, runbook]
created: 2026-08-07
links:
  - "[[convention/synthetic-analytics-pipeline/testing-convention]]"
  - "[[business-logic/synthetic-analytics-pipeline/job-priority-policy]]"
---

# Nightly Batch Window Capacity Runbook

ขั้นตอนสำหรับจัดการเมื่อ nightly batch window (01:00-04:00) มี job รอคิวมากเกินกว่าที่จะรันเสร็จทันเวลาที่ dashboard เช้าต้องการ

## ก่อน batch window เริ่ม

ตรวจสอบว่าไม่มี backfill job ขนาดใหญ่ที่ยังไม่จำเป็นเร่งด่วนถูก schedule ทับช่วงเวลานี้ ตาม [[convention/synthetic-analytics-pipeline/testing-convention]] ที่กำหนดให้ transform rule ใหม่ต้องผ่าน regression test ก่อน merge เข้า batch หลักเสมอ

## เมื่อคิวล้นระหว่าง window

ให้ priority ตาม [[business-logic/synthetic-analytics-pipeline/job-priority-policy]] เป็นตัวตัดสินว่า job ไหนรันก่อน ถ้ายังไม่ทันจริงๆ ให้ delay job priority ต่ำสุดออกไปรันหลัง batch window แทนที่จะพยายามยัดทุกอย่างให้เสร็จในเวลาเดิม
