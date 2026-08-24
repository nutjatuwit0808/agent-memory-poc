---
layer: structure
tags: [ad-bidding, adpulse, boundaries]
created: 2026-04-22
links:
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง — [[structure/synthetic-ad-bidding/module-budget-pacer]] เป็นเจ้าของตัวเลข spend สะสมของแต่ละแคมเปญเท่านั้น ไม่รู้จัก concept ของ auction หรือ bid request เลย ส่วน [[structure/synthetic-ad-bidding/module-auction-engine]] ไม่เก็บ state เรื่องเงินถาวรเลยแม้แต่บรรทัดเดียว — ทุกครั้งที่ต้องตัดสินใจว่าแคมเปญไหนยังมี budget เหลือ ต้อง query budget-pacer สดเสมอ

[[structure/synthetic-ad-bidding/module-bid-request-handler]] เป็น service เดียวที่ต้องคุยกับทั้ง auction-engine, fraud-filter, และ creative-renderer พร้อมกันภายใน request เดียว เพราะเป็นจุดรวมของ pipeline ทั้งหมดก่อนตอบ bid response กลับไปยัง SSP — ออกแบบให้ทุก dependency call เป็น timeout สั้นมาก (รวมกันต่ำกว่า 100ms) ไม่งั้นจะพลาด deadline ของ SSP ไปเลย
