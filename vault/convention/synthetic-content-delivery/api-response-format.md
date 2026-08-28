---
layer: convention
tags: [api, convention]
created: 2026-02-17
links:
  - "[[convention/synthetic-content-delivery/error-code-convention]]"
---

# API Response Format

## โครงสร้าง

ทุก response ห่อด้วย `{ data, error, meta }` โดย `meta` มีข้อมูล เช่น `requestId`, `tenantId`, `edgeNodeId` เพื่อ debug ได้ว่า request นี้ถูก serve โดย PoP ไหน `error` เป็น `null` เมื่อสำเร็จเท่านั้น

## Error object

`{ code, message, retryAfter? }` โดย `code` ต้องตรงกับ [[convention/synthetic-content-delivery/error-code-convention]] เสมอ `retryAfter` ใส่เมื่อ error เป็นแบบ rate-limit หรือ quota exceeded เพื่อให้ client รู้ว่าควร retry เมื่อไหร่
