---
layer: convention
tags: [api, convention]
created: 2026-01-10
links:
  - "[[convention/synthetic-loyalty-rewards/error-code-convention]]"
---

# API Response Format

## โครงสร้าง

ทุก response ห่อด้วย `{ data, error }` — `error` เป็น `null` เมื่อสำเร็จ `data` เป็น `null` เมื่อ error ไม่ปนกันในผลเดียวกัน

## Error object

`{ code, message, details? }` โดย `code` ต้องตรงกับ [[convention/synthetic-loyalty-rewards/error-code-convention]] ห้ามส่ง stack trace หรือ DB error message ออกไปตรงๆ
