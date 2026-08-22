---
layer: convention
tags: [logging, observability]
created: 2026-02-20
links:
  - "[[deployment/monitoring-alerts]]"
---

# Logging Convention

## ระดับ log

- `debug` — รายละเอียดตอน dev เท่านั้น ปิดใน production
- `info` — เหตุการณ์ปกติที่อยากเห็นใน production เช่น "order created", "refund approved"
- `warn` — สถานการณ์ที่ผิดปกติแต่ระบบ recover เองได้ เช่น retry สำเร็จรอบที่ 2
- `error` — operation ล้มเหลวและต้องมีคนดู

## รูปแบบ

ทุก log entry เป็น structured JSON ไม่ใช่ string message ธรรมดา

```json
{
  "level": "error",
  "msg": "refund processing failed",
  "requestId": "req_abc123",
  "orderId": "ord_9981",
  "errorCode": "PAYMENT_GATEWAY_TIMEOUT",
  "timestamp": "2026-02-20T09:14:22Z"
}
```

## กติกา

- ห้าม log ข้อมูลบัตรเครดิตหรือ token เต็มรูปแบบ — mask เหลือ 4 ตัวท้ายเท่านั้น
- `requestId` ต้องอยู่ใน log ทุกบรรทัดที่เกี่ยวกับ request เดียวกัน เพื่อ trace ข้าม service ได้
- log ที่ระดับ `error` ต้อง trigger alert ผ่านช่องทางที่อธิบายไว้ใน [[deployment/monitoring-alerts]]
