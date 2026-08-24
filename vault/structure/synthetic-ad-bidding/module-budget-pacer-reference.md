---
layer: structure
tags: [budget, module, core, reference, identifiers]
created: 2025-12-29
links:
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
  - "[[business-logic/synthetic-ad-bidding/budget-pacing-policy]]"
---

# budget-pacer — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด budget-pacer สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-ad-bidding/module-budget-pacer]])

## Public functions
- `getRemainingBudget(campaignId: string): Promise<number>` — คืนยอด budget คงเหลือของแคมเปญ ณ ขณะนั้น
- `recordSpend(campaignId: string, amount: number, winNoticeId: string): Promise<void>` — บันทึกยอดที่ใช้ไปจริงจาก win notice
- `computeThrottleRate(campaignId: string): Promise<number>` — คำนวณสัดส่วน bid ที่ควรเข้าประมูลจริงเทียบกับ eligible ทั้งหมด เพื่อ pace การใช้เงิน

## Internal constants
- `PACING_SYNC_INTERVAL_MS = 1000`
- `OVERSPEND_TOLERANCE_PCT = 2`

## Type

```ts
interface PacingState {
  campaignId: string;
  dailyBudget: number;
  spentSoFar: number;
  throttleRate: number; // 0.0 - 1.0
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง pacing ที่ [[business-logic/synthetic-ad-bidding/budget-pacing-policy]]
