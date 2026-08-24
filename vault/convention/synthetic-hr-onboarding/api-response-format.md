---
layer: convention
tags: [api, convention]
created: 2025-10-20
links:
  - "[[convention/synthetic-hr-onboarding/error-code-convention]]"
---

# API Response Format

## โครงสร้าง

ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น

## Error object

`{ code, message, details? }` โดย `code` ต้องตรงกับ [[convention/synthetic-hr-onboarding/error-code-convention]] เสมอ ห้ามส่ง raw exception message ของ backend ออกไปตรงๆ
