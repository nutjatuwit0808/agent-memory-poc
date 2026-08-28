---
layer: convention
tags: [testing, quality]
created: 2026-03-13
links:
  - "[[support-cases/synthetic-legal-contracts/case-4512]]"
  - "[[support-cases/synthetic-legal-contracts/case-6410]]"
---

# Testing Convention

## Concurrent test

ฟังก์ชันที่แก้ approval chain หรือ template ต้องมี test จำลอง concurrent call อย่างน้อย 2 ตัวเสมอ — บทเรียนจาก [[support-cases/synthetic-legal-contracts/case-4512]]

## Approval chain test

ทุกโครงสร้างราคาที่รองรับ (คงที่, ขั้นบันได, revenue-share) ต้องมี test ยืนยันว่าคำนวณมูลค่าและ route เข้า tier อนุมัติถูกต้อง — บทเรียนจาก [[support-cases/synthetic-legal-contracts/case-6410]]
