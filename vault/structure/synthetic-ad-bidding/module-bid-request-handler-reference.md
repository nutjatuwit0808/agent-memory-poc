---
layer: structure
tags: [bidding, module, core, reference, identifiers]
created: 2026-06-12
links:
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
  - "[[business-logic/synthetic-ad-bidding/bid-timeout-policy]]"
---

# bid-request-handler — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด bid-request-handler สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-ad-bidding/module-bid-request-handler]])

## Public functions
- `handleBidRequest(req: OpenRtbBidRequest): Promise<BidResponse | NoBidResponse>` — รับ request แปลงเป็น internal format แล้ว orchestrate เรียก fraud-filter → auction-engine → creative-renderer ตามลำดับ
- `allocateTimeBudget(totalMs: number): TimeBudgetPlan` — แบ่งเวลาที่เหลือให้แต่ละ downstream call ตามลำดับความสำคัญ
- `buildNoBidResponse(reason: NoBidReason): NoBidResponse` — สร้างคำตอบปฏิเสธประมูลพร้อมเหตุผลที่จัดหมวดไว้แล้ว

## Internal constants
- `BID_REQUEST_TIMEOUT_MS = 80`
- `DOWNSTREAM_CALL_BUDGET_MS = 60`

## Type

```ts
interface BidResponse {
  requestId: string;
  campaignId: string;
  price: number;
  creativeMarkup: string;
}

interface NoBidResponse {
  requestId: string;
  reason: "fraud_blocked" | "no_eligible_campaign" | "budget_exhausted" | "timed_out";
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-ad-bidding/bid-timeout-policy]]
