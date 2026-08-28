---
layer: structure
tags: [inventory, module, core, reference, identifiers]
created: 2026-04-22
links:
  - "[[structure/synthetic-event-ticketing/module-seat-inventory]]"
  - "[[business-logic/synthetic-event-ticketing/hold-expiry-timeout-policy]]"
---

# seat-inventory — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด seat-inventory สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-event-ticketing/module-seat-inventory]])

## Public functions
- `holdSeat(seatId: string, buyerId: string, ttlSeconds: number): Promise<string>` — จองที่นั่งชั่วคราว คืน holdId ถ้าสำเร็จ ปฏิเสธถ้าที่นั่งไม่ว่าง
- `confirmSale(holdId: string): Promise<void>` — ยืนยันการขายจาก hold ที่ชำระเงินสำเร็จแล้ว เปลี่ยนสถานะเป็น sold
- `releaseSeat(seatId: string): Promise<void>` — ปล่อยที่นั่งกลับเป็น available เมื่อ hold หมดอายุหรือถูกยกเลิก

## Internal constants
- `SEAT_HOLD_DEFAULT_TTL_SECONDS = 600`
- `MAX_CONCURRENT_HOLDS_PER_BUYER = 8`

## Type

```ts
interface SeatStatus {
  seatId: string;
  status: "available" | "held" | "sold";
  holdId?: string;
  holdExpiresAt?: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการหมดอายุ hold ที่ [[business-logic/synthetic-event-ticketing/hold-expiry-timeout-policy]]
