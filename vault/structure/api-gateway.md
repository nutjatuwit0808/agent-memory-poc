---
layer: structure
tags: [api, gateway, architecture]
created: 2026-01-26
links:
  - "[[structure/overview-architecture]]"
  - "[[convention/api-response-format]]"
  - "[[structure/module-auth]]"
---

# API Gateway

จุดเข้าเดียวสำหรับ client ทั้งหมด (web, mobile app) ก่อนกระจายไปยัง service ภายใน

## หน้าที่

- verify JWT token ผ่าน [[structure/module-auth]] ก่อนส่งต่อทุก request
- rate limiting ต่อ user (100 request/นาที สำหรับ endpoint ทั่วไป, 10 request/นาที สำหรับ endpoint ที่แตะ payment)
- แปลง response ของทุก service ให้อยู่ในรูปแบบเดียวกันตาม [[convention/api-response-format]]
- รวม log request/response พร้อม `requestId` เดียวกันตลอดทั้ง chain

## Routing

```
/api/orders/*      -> order-service
/api/payments/*     -> payment-service
/api/refunds/*      -> refund-service
/api/auth/*         -> auth-service (ไม่ต้อง verify token)
```

## เหตุผลที่มี gateway ชั้นเดียว

ไม่ใช้ service mesh เพราะ scale ปัจจุบันยังเล็ก — gateway ตัวเดียวพอจัดการ cross-cutting concern (auth, rate limit, format) ได้โดยไม่ต้อง maintain infra ซับซ้อนเพิ่ม
