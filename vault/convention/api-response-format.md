---
layer: convention
tags: [api, http, format]
created: 2026-02-02
links:
  - "[[convention/error-code-convention]]"
  - "[[structure/api-gateway]]"
---

# API Response Format

ทุก endpoint ใน API gateway ต้อง return JSON ตามโครงนี้เท่านั้น ห้าม endpoint ไหน return รูปแบบอื่น

## Success

```json
{
  "ok": true,
  "data": { ... },
  "meta": { "requestId": "req_abc123" }
}
```

## Error

```json
{
  "ok": false,
  "error": {
    "code": "REFUND_ALREADY_PROCESSED",
    "message": "รายการนี้ถูกคืนเงินไปแล้ว",
    "requestId": "req_abc123"
  }
}
```

## กติกา

- `data` ต้องไม่เป็น `null` เมื่อ `ok: true` — ถ้าไม่มีข้อมูลให้ return `{}` หรือ `[]`
- `error.code` ต้องเป็น `SCREAMING_SNAKE_CASE` และมาจาก enum กลางใน [[convention/error-code-convention]]
- `error.message` เป็นภาษาไทยเสมอ เพราะ frontend เอาไปโชว์ user ตรงๆ ไม่ผ่านการแปล
- `meta.requestId` ต้องมีทุก response เพื่อ trace log ย้อนหลังได้ — ดูการเชื่อมกับ [[structure/api-gateway]]
- pagination ใช้ `meta.nextCursor` ไม่ใช้ `page`/`limit` เพราะ dataset เปลี่ยนแปลงบ่อย offset-based จะข้ามหรือซ้ำ record ได้
