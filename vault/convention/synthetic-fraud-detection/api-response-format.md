---
layer: convention
tags: [api, convention]
created: 2025-09-24
links:
  - "[[convention/synthetic-fraud-detection/error-code-convention]]"
---

# API Response Format

## โครงสร้าง

ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น

## Error object

`{ code, message, details? }` โดย `code` ต้องตรงกับ [[convention/synthetic-fraud-detection/error-code-convention]] เสมอ decision ที่ block ผู้ใช้ต้องมี `details.reason` field เพื่อให้ support team อธิบายกับลูกค้าได้
