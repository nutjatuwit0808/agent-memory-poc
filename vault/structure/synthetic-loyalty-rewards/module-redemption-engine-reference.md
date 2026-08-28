---
layer: structure
tags: [redemption, module, core, reference, identifiers]
created: 2026-03-02
links:
  - "[[structure/synthetic-loyalty-rewards/module-redemption-engine]]"
  - "[[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy]]"
---

# redemption-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด redemption-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-loyalty-rewards/module-redemption-engine]])

## Public functions
- `initiateRedemption(accountId: string, rewardId: string): Promise<RedemptionOrder>` — เริ่มกระบวนการแลกรางวัล ตรวจสิทธิ์และล็อก balance ก่อน
- `confirmRedemption(orderId: string): Promise<void>` — ยืนยัน redemption ทำ debit จริง และส่ง fulfillment request
- `cancelRedemption(orderId: string, reason: string): Promise<void>` — ยกเลิก redemption และคืน locked points กลับเข้าบัญชี
- `getRedemptionStatus(orderId: string): Promise<RedemptionOrder>` — ดึงสถานะปัจจุบันของ redemption order

## Internal constants
- `REDEMPTION_LOCK_TTL_MINUTES = 15`
- `MIN_REDEMPTION_POINTS = 500`
- `MAX_DAILY_REDEMPTIONS_PER_ACCOUNT = 5`

## Type

```ts
interface RedemptionOrder {
  orderId: string;
  accountId: string;
  rewardId: string;
  pointsCost: number;
  status: "pending" | "points_locked" | "confirmed" | "cancelled";
  lockedUntil?: string;
  createdAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเกณฑ์การแลกที่ [[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy]]
