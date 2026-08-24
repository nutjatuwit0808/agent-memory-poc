---
layer: structure
tags: [auction, module, core, reference, identifiers]
created: 2026-06-08
links:
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
  - "[[business-logic/synthetic-ad-bidding/floor-price-policy]]"
---

# auction-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด auction-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-ad-bidding/module-auction-engine]])

## Public functions
- `runInternalAuction(candidates: CampaignCandidate[]): Promise<AuctionResult>` — รันประมูลภายในระหว่างแคมเปญที่ผ่าน targeting ทั้งหมด คืนผู้ชนะ
- `computeBidPrice(campaignId: string, ctx: AuctionContext): number` — คำนวณราคาที่จะเสนอ ตาม bid strategy ของแคมเปญ
- `applyFloorPrice(price: number, floor: number): number` — บังคับราคาไม่ให้ต่ำกว่า floor ที่ SSP กำหนด

## Internal constants
- `AUCTION_MAX_CANDIDATES = 300`
- `FLOOR_PRICE_SANITY_MULTIPLIER = 3`

## Type

```ts
interface AuctionResult {
  winnerCampaignId: string | null;
  clearingPrice: number;
  candidateCount: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องราคาที่ [[business-logic/synthetic-ad-bidding/floor-price-policy]]
