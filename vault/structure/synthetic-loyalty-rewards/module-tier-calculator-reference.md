---
layer: structure
tags: [tier, module, core, reference, identifiers]
created: 2025-11-04
links:
  - "[[structure/synthetic-loyalty-rewards/module-tier-calculator]]"
  - "[[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]]"
---

# tier-calculator — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด tier-calculator สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-loyalty-rewards/module-tier-calculator]])

## Public functions
- `getCurrentTier(accountId: string): Promise<TierStatus>` — คืน tier ปัจจุบันและยอดแต้มสะสมในรอบปีที่ใช้คำนวณ
- `evaluateTierChange(accountId: string): Promise<TierChangeResult>` — ตรวจว่าสมาชิกควร upgrade หรือ downgrade จาก tier ปัจจุบัน
- `applyGracePeriod(accountId: string, reason: GraceReason): Promise<void>` — ตั้ง grace period เมื่อสมาชิกอยู่ใน downgrade zone ดู [[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]]
- `getAnnualPointsSummary(accountId: string, year: number): Promise<AnnualSummary>` — คืนยอดแต้มสะสมและสถิติ tier ของรอบปีที่ระบุ

## Internal constants
- `SILVER_THRESHOLD_POINTS = 5000`
- `GOLD_THRESHOLD_POINTS = 15000`
- `PLATINUM_THRESHOLD_POINTS = 40000`
- `DOWNGRADE_GRACE_PERIOD_DAYS = 90`

## Type

```ts
interface TierStatus {
  accountId: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  annualPoints: number;
  gracePeriodEndsAt?: string;
  nextEvaluationAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง grace period ที่ [[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]]
