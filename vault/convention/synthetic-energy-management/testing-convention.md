---
layer: convention
tags: [testing, quality]
created: 2026-04-19
links:
  - "[[support-cases/synthetic-energy-management/case-3658]]"
  - "[[support-cases/synthetic-energy-management/case-4482]]"
---

# Testing Convention

## Concurrent test

ฟังก์ชันที่ส่งคำสั่งควบคุมอุปกรณ์ต้องมี test จำลอง concurrent call จากหลายแหล่งพร้อมกันเสมอ — บทเรียนจาก [[support-cases/synthetic-energy-management/case-3658]]

## Data gap test

ฟังก์ชันที่คำนวณจากข้อมูล time-series ต้องมี test กรณีข้อมูลขาดหายบางช่วงเสมอ — บทเรียนจาก [[support-cases/synthetic-energy-management/case-4482]]
