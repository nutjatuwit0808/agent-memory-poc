---
layer: convention
tags: [testing, latency]
created: 2026-06-17
links:
  - "[[business-logic/synthetic-ad-bidding/bid-timeout-policy]]"
  - "[[support-cases/synthetic-ad-bidding/case-3172]]"
  - "[[support-cases/synthetic-ad-bidding/case-4635]]"
---

# Testing Convention

## Latency test ก่อนขึ้นจริง

โค้ดที่อยู่ใน critical path ของ bid request (ภายใน time budget ตาม [[business-logic/synthetic-ad-bidding/bid-timeout-policy]]) ต้องผ่าน load test ที่ p99 latency ก่อน merge เสมอ — บทเรียนจาก [[support-cases/synthetic-ad-bidding/case-3172]] คือ memory usage ต้องเป็นส่วนหนึ่งของเกณฑ์ด้วย ไม่ใช่แค่ latency เฉลี่ย

## Concurrent test

ฟังก์ชันที่แตะ budget spend ต้องมี test จำลอง request พร้อมกันจากหลาย region อย่างน้อย 2 ตัวเสมอ (บทเรียนจาก [[support-cases/synthetic-ad-bidding/case-4635]])
