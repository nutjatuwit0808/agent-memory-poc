---
layer: structure
tags: [auction, module, core]
created: 2025-09-22
links:
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
  - "[[business-logic/synthetic-ad-bidding/budget-pacing-policy]]"
  - "[[structure/synthetic-ad-bidding/module-creative-renderer]]"
---

# Module: auction-engine

ตัดสินใจว่าจะประมูลราคาเท่าไหร่ และเลือกแคมเปญที่ชนะเมื่อมีหลายแคมเปญแข่งกันสำหรับ request เดียวกัน (internal auction ก่อนส่งราคาสุดท้ายออกไปแข่งกับ SSP ภายนอกอีกที) แยกออกจาก bid-request-handler เพื่อให้ทดสอบ logic การคำนวณราคาได้อิสระจาก orchestration

## ฟังก์ชันหลัก
- `runInternalAuction(candidates: CampaignCandidate[]): Promise<AuctionResult>` — รันประมูลภายในระหว่างแคมเปญที่ผ่าน targeting ทั้งหมด คืนผู้ชนะ
- `computeBidPrice(campaignId: string, ctx: AuctionContext): number` — คำนวณราคาที่จะเสนอ ตาม bid strategy ของแคมเปญ
- `applyFloorPrice(price: number, floor: number): number` — บังคับราคาไม่ให้ต่ำกว่า floor ที่ SSP กำหนด

## State

candidates_gathered → priced → floor_applied → winner_selected | no_winner

## ความสัมพันธ์กับ module อื่น

`runInternalAuction` เรียก [[structure/synthetic-ad-bidding/module-budget-pacer]] เพื่อกรองแคมเปญที่ budget หมดออกก่อนเริ่มประมูลเสมอ (ดู [[business-logic/synthetic-ad-bidding/budget-pacing-policy]]) ราคาที่ชนะจะถูกส่งต่อให้ [[structure/synthetic-ad-bidding/module-creative-renderer]] เพื่อเตรียม creative ก่อนตอบกลับ SSP
