---
layer: convention
tags: [api, convention]
created: 2026-07-03
links:
  - "[[convention/synthetic-social-feed/error-code-convention]]"
---

# API Response Format

## โครงสร้าง

ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น

## Error object

`{ code, message, details? }` โดย `code` ต้องตรงกับ [[convention/synthetic-social-feed/error-code-convention]] เสมอ ห้ามส่ง raw exception message ของ backend ออกไปตรงๆ
