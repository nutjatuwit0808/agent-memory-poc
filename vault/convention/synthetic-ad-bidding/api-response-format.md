---
layer: convention
tags: [api, convention]
created: 2025-09-23
links:
  - "[[convention/synthetic-ad-bidding/error-code-convention]]"
---

# API Response Format

## โครงสร้าง

bid response ทุกตัวห่อด้วยรูปแบบ OpenRTB มาตรฐานเสมอ ไม่เพิ่ม field แปลกปนนอก spec แม้จะเป็น internal metadata ก็ต้องส่งผ่าน extension field ที่กำหนดไว้เท่านั้น

## Error response

no-bid response ไม่ใช่ error — ส่งเป็น HTTP 204 ตาม spec OpenRTB เสมอ ส่วน error จริง (เช่น malformed request) ใช้ `{ code, message }` โดย `code` ต้องตรงกับ [[convention/synthetic-ad-bidding/error-code-convention]]
