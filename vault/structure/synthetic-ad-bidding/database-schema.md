---
layer: structure
tags: [ad-bidding, adpulse, database, schema]
created: 2026-06-20
links:
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-ad-bidding/module-budget-pacer]] ดูแล ได้แก่ `campaign_spend` (ตัวเลข spend สะสมต่อแคมเปญต่อวัน) และ `pacing_state` (throttle rate ปัจจุบันของแต่ละแคมเปญ)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `campaign_spend` | budget-pacer | อัปเดตแบบ near-real-time ทุกครั้งที่มี win notice |
| `bids` | auction-engine | log ผลการประมูลภายในทุกครั้ง (win/lose) เก็บ 30 วัน |
| `fraud_scores` | fraud-filter | คะแนน fraud ต่อ request_id พร้อมเหตุผลที่จัดหมวดไว้ |
| `creatives` | creative-renderer | metadata ของ creative แต่ละชิ้น ไม่เก็บไฟล์จริง (อยู่ CDN) |

ทุกตารางใช้ `campaign_id` เป็น foreign key ร่วมกันแบบ soft reference เท่านั้น เพราะแต่ละ service แยก database กันจริง ไม่มี FK constraint ข้าม database ตรวจสอบความสอดคล้องด้วย reconciliation job รายชั่วโมงแทน
