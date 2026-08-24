---
layer: convention
tags: [testing, quality]
created: 2026-01-30
links:
  - "[[support-cases/synthetic-chat-support-bot/case-4414]]"
---

# Testing Convention

## Test ก่อนขึ้นจริง

การเปลี่ยนโมเดลจำแนก intent ต้องผ่านการเทียบสัดส่วนผลจำแนกกับโมเดลเดิมก่อน merge เสมอ — บทเรียนจาก [[support-cases/synthetic-chat-support-bot/case-4414]] คือการไม่เทียบสัดส่วนก่อน deploy เจอ regression ไม่ทัน

## Concurrent test

ฟังก์ชันที่แตะการเขียน turn เข้าประวัติบทสนทนาต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ
