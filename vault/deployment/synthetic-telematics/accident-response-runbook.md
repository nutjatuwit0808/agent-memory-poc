---
layer: deployment
tags: [accident, safety, runbook]
created: 2026-06-29
links:
  - "[[structure/synthetic-telematics/module-accident-detector]]"
  - "[[support-cases/synthetic-telematics/case-2423]]"
---

# Accident Response Runbook

ขั้นตอนเมื่อระบบตรวจพบสัญญาณอุบัติเหตุ ต้องดำเนินการเร็วที่สุดเพราะกระทบความปลอดภัยของผู้ขับโดยตรง

## เมื่อตรวจพบสัญญาณ

[[structure/synthetic-telematics/module-accident-detector]] แจ้งเตือนทีมช่วยเหลือฉุกเฉินทันทีที่ confidence score เกินเกณฑ์ ไม่รอการยืนยันด้วยมือก่อน เพราะความล่าช้าในการช่วยเหลืออาจมีผลร้ายแรงกว่าการแจ้งเตือนที่ผิดพลาด

## บทเรียนจากเหตุการณ์จริง

ดู [[support-cases/synthetic-telematics/case-2423]] — ต้องพิจารณาความเร่งรวมจากทุกแนว ไม่ใช่แนวเดียว เพื่อไม่ให้พลาดอุบัติเหตุจริงที่มีลักษณะการชนแบบเฉียง
