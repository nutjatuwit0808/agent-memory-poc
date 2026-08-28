---
layer: convention
tags: [api, convention]
created: 2026-02-14
links:
  - "[[convention/synthetic-e-learning/error-code-convention]]"
---

# API Response Format

## โครงสร้าง

ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น

## Error object

`{ code, message, details? }` โดย `code` ต้องตรงกับ [[convention/synthetic-e-learning/error-code-convention]] เสมอ ห้ามส่ง raw exception message ออกไปตรงๆ โดยเฉพาะ exception จาก assessment engine ที่อาจมีข้อมูล answer ปน
