---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-08-01
links:
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
  - "[[business-logic/synthetic-ad-bidding/bid-timeout-policy]]"
  - "[[support-cases/synthetic-ad-bidding/case-8741]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → latency load test (สำหรับ service ใน critical path ของ bid request) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้ง pipeline

## Gate พิเศษ

[[structure/synthetic-ad-bidding/module-bid-request-handler]] และ [[structure/synthetic-ad-bidding/module-auction-engine]] ต้องผ่าน latency load test ที่ p99 ไม่เกิน time budget ที่กำหนดใน [[business-logic/synthetic-ad-bidding/bid-timeout-policy]] ก่อน merge เสมอ นอกจากนี้ service ที่แชร์ schema กันต้อง deploy ตามลำดับ consumer ก่อน producer (บทเรียนจาก [[support-cases/synthetic-ad-bidding/case-8741]])
