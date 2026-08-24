---
layer: structure
tags: [ad-bidding, adpulse, queue, async]
created: 2026-02-08
links:
  - "[[structure/synthetic-ad-bidding/module-win-notice-processor]]"
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
  - "[[structure/synthetic-ad-bidding/module-fraud-filter]]"
  - "[[structure/synthetic-ad-bidding/service-boundaries]]"
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `bid.won`, `bid.lost`, `creative.rejected`, `fraud.flagged`, `campaign.budget_exhausted` — [[structure/synthetic-ad-bidding/module-win-notice-processor]] publish `bid.won` ทันทีที่ได้รับ win notice จาก SSP แล้วให้ [[structure/synthetic-ad-bidding/module-budget-pacer]] subscribe เพื่ออัปเดตยอด spend

[[structure/synthetic-ad-bidding/module-fraud-filter]] publish `fraud.flagged` แบบ asynchronous เท่านั้น ไม่ block bid response — เพราะการตัดสินใจ fraud แบบ real-time ทำใน request path อยู่แล้ว (ดู [[structure/synthetic-ad-bidding/service-boundaries]]) event นี้ใช้สำหรับ retrain/analysis ทีหลัง ไม่ใช่ signal ที่ [[structure/synthetic-ad-bidding/module-auction-engine]] ต้องรอ
