---
layer: convention
tags: [testing, simulation]
created: 2025-10-31
links:
  - "[[support-cases/synthetic-iot-fleet-tracker/case-7946]]"
---

# Testing Convention

## Replay test ด้วยข้อมูลจริง

logic ที่ประมวลผลตำแหน่งต้องผ่าน replay test ด้วยชุด ping จริงที่เคยเกิดปัญหามาก่อนเสมอ — บทเรียนจาก [[support-cases/synthetic-iot-fleet-tracker/case-7946]] คือ synthetic test data ที่สร้างพิกัดสวยเกินจริงไม่เจอ noise pattern แบบที่เกิดในสถานที่จริง

## Concurrent test

ฟังก์ชันที่แตะสถานะการผูกอุปกรณ์กับยานพาหนะต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ
