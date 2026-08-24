---
layer: structure
tags: [booking, module, core, reference, identifiers]
created: 2026-06-29
links:
  - "[[structure/synthetic-travel-booking/module-booking-engine]]"
  - "[[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]]"
---

# booking-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด booking-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-travel-booking/module-booking-engine]])

## Public functions
- `holdInventory(offerId: string, ttlSec: number): Promise<HoldToken>` — จองห้องชั่วคราวระหว่างผู้ใช้กรอกข้อมูลชำระเงิน
- `confirmBooking(holdToken: string, paymentRef: string): Promise<BookingResult>` — ยืนยันการจองจริงจาก hold ที่ยังไม่หมดอายุ
- `releaseHold(holdToken: string, reason: string): Promise<void>` — ปล่อย hold คืนก่อนหมดอายุ เช่น ผู้ใช้ยกเลิกเองระหว่างกรอกฟอร์ม

## Internal constants
- `BOOKING_HOLD_TTL_SEC = 600`
- `MAX_CONCURRENT_HOLDS_PER_OFFER = = จำนวนห้องว่างจริง ณ ขณะนั้น`

## Type

```ts
interface BookingResult {
  bookingId: string;
  status: "confirmed" | "rejected";
  offerId: string;
  rejectReason?: "hold_expired" | "inventory_unavailable";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการกัน double-booking ที่ [[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]]
