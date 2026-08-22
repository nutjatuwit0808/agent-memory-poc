---
layer: convention
tags: [error-handling, api]
created: 2026-02-03
links:
  - "[[convention/api-response-format]]"
  - "[[business-logic/refund-policy]]"
---

# Error Code Convention

Error code ทั้งหมดในระบบเป็น `SCREAMING_SNAKE_CASE` แบ่งเป็น namespace ตาม prefix

## Namespace

| Prefix | ความหมาย | ตัวอย่าง |
|---|---|---|
| `PAYMENT_` | เกี่ยวกับการชำระเงิน | `PAYMENT_GATEWAY_TIMEOUT`, `PAYMENT_DECLINED` |
| `REFUND_` | เกี่ยวกับการคืนเงิน | `REFUND_ALREADY_PROCESSED`, `REFUND_LIMIT_EXCEEDED` |
| `ORDER_` | เกี่ยวกับ order | `ORDER_NOT_FOUND`, `ORDER_ALREADY_CANCELLED` |
| `AUTH_` | authentication/authorization | `AUTH_TOKEN_EXPIRED` |
| `INVENTORY_` | สต็อกสินค้า | `INVENTORY_INSUFFICIENT` |

## กติกาการเพิ่ม error code ใหม่

1. ต้องมี prefix namespace เสมอ ห้ามตั้งชื่อลอยๆ เช่น `NOT_FOUND` เฉยๆ
2. ห้ามใช้ error code เดิมซ้ำความหมาย — ก่อนเพิ่มใหม่ให้ grep ใน `error-codes.ts` ก่อน
3. ทุก error code ต้องมี message ภาษาไทยที่ user อ่านแล้วเข้าใจว่าต้องทำอะไรต่อ ไม่ใช่แค่บอกว่าอะไรพัง

ตัวอย่างการใช้งานจริงดูได้ที่ [[business-logic/refund-policy]] ซึ่งใช้ `REFUND_ALREADY_PROCESSED` และ `REFUND_LIMIT_EXCEEDED` เป็นหลัก
