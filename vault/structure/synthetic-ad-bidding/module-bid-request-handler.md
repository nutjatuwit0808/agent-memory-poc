---
layer: structure
tags: [bidding, module, core]
created: 2025-11-21
links:
  - "[[business-logic/synthetic-ad-bidding/bid-timeout-policy]]"
  - "[[structure/synthetic-ad-bidding/module-fraud-filter]]"
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
---

# Module: bid-request-handler

จุดเข้าเดียวของทุก bid request จาก SSP รับผิดชอบ orchestrate ทั้ง pipeline ภายใน time budget ที่แคบมาก แยกออกมาเป็น service อิสระตั้งแต่ต้นปี 2025 เพราะ logic orchestration (retry, การแบ่งเวลาให้แต่ละ downstream call) ซับซ้อนขึ้นจนปนกับ auction-engine เดิมแล้วทดสอบยาก

## ฟังก์ชันหลัก
- `handleBidRequest(req: OpenRtbBidRequest): Promise<BidResponse | NoBidResponse>` — รับ request แปลงเป็น internal format แล้ว orchestrate เรียก fraud-filter → auction-engine → creative-renderer ตามลำดับ
- `allocateTimeBudget(totalMs: number): TimeBudgetPlan` — แบ่งเวลาที่เหลือให้แต่ละ downstream call ตามลำดับความสำคัญ
- `buildNoBidResponse(reason: NoBidReason): NoBidResponse` — สร้างคำตอบปฏิเสธประมูลพร้อมเหตุผลที่จัดหมวดไว้แล้ว

## State

received → fraud_checking → auctioning → rendering → responded | no_bid | timed_out — ดู [[business-logic/synthetic-ad-bidding/bid-timeout-policy]] สำหรับเงื่อนไข time budget ของแต่ละขั้น

## ความสัมพันธ์กับ module อื่น

เรียก [[structure/synthetic-ad-bidding/module-fraud-filter]] ก่อนเสมอ เพราะถ้า request ถูก flag ว่า fraud จะไม่เสียเวลาเรียก [[structure/synthetic-ad-bidding/module-auction-engine]] เลย — ลำดับนี้ตั้งใจให้ fraud check อยู่หน้าสุดของ pipeline เพื่อประหยัด time budget ที่แคบมาก
