---
layer: structure
tags: [cancellation, refund, module, core, reference, identifiers]
created: 2025-10-15
links:
  - "[[structure/synthetic-travel-booking/module-cancellation-handler]]"
  - "[[business-logic/synthetic-travel-booking/cancellation-refund-proration-policy]]"
---

# cancellation-handler — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด cancellation-handler สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-travel-booking/module-cancellation-handler]])

## Public functions
- `cancelBooking(bookingId: string, reason: string): Promise<CancellationResult>` — เริ่มกระบวนการยกเลิก คำนวณค่าธรรมเนียมและสถานะคืนเงิน
- `computeRefundAmount(bookingId: string, cancelledAt: Date): Promise<RefundBreakdown>` — คำนวณจำนวนเงินคืนตาม proration ของช่วงเวลาที่เหลือ
- `processRefund(bookingId: string, breakdown: RefundBreakdown): Promise<void>` — สั่งคืนเงินจริงผ่าน payment provider ตามยอดที่คำนวณได้

## Internal constants
- `CANCELLATION_FEE_GRACE_HOURS = 48`
- `NON_REFUNDABLE_RATE_PREFIX = "NR-"`

## Type

```ts
interface RefundBreakdown {
  bookingId: string;
  originalAmountMinor: number;
  feeMinor: number;
  refundAmountMinor: number;
  currency: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง proration ที่ [[business-logic/synthetic-travel-booking/cancellation-refund-proration-policy]]
