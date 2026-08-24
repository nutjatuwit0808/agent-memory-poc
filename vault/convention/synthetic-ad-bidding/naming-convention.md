---
layer: convention
tags: [naming, style]
created: 2026-08-01
links:
  - "[[business-logic/synthetic-ad-bidding/win-notice-dedup-policy]]"
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `computeBidPrice`, `applyFloorPrice` — ฟังก์ชันที่คืนค่าผลการตัดสินใจ (win/lose/block) ใช้คำนามที่ชัดเจน ไม่ใช้คำกำกวมอย่าง `process` เดี่ยวๆ

## Identifier ทางธุรกิจ

`campaignId` รูปแบบ `CMP-<6 หลัก>`, `noticeId` มาจาก SSP โดยตรงห้ามแก้รูปแบบ ต้องเก็บคู่กับ `sspId` เสมอเพื่อความ unique (ดู [[business-logic/synthetic-ad-bidding/win-notice-dedup-policy]])
