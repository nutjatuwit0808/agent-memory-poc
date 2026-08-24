---
layer: structure
tags: [billing, module]
created: 2026-05-27
links:
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
  - "[[structure/synthetic-ad-bidding/queue-architecture]]"
  - "[[business-logic/synthetic-ad-bidding/win-notice-dedup-policy]]"
---

# Module: win-notice-processor

รับ win notice จาก SSP เมื่อ AdPulse ชนะประมูลจริงในตลาดภายนอก (ต่างจาก internal auction ที่ auction-engine ทำ) แล้วเรียกเก็บเงินแคมเปญที่ชนะ เป็น service เดียวที่ trigger การหักเงินจริงในระบบทั้งหมด

## ฟังก์ชันหลัก
- `handleWinNotice(notice: WinNotice): Promise<void>` — รับ win notice ตรวจสอบ dedup แล้ว trigger การหักเงิน
- `deduplicateNotice(noticeId: string, sspId: string): Promise<boolean>` — เช็คว่า notice นี้เคยประมวลผลไปแล้วหรือยัง
- `chargeCampaign(campaignId: string, amount: number, winNoticeId: string): Promise<void>` — หักเงินแคมเปญจริงตามยอดที่ชนะ

## ความสัมพันธ์กับ module อื่น

publish event `bid.won` ให้ [[structure/synthetic-ad-bidding/module-budget-pacer]] subscribe (ดู [[structure/synthetic-ad-bidding/queue-architecture]]) เกณฑ์การกัน duplicate billing ดู [[business-logic/synthetic-ad-bidding/win-notice-dedup-policy]]
