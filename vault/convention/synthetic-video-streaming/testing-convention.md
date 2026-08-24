---
layer: convention
tags: [testing, quality]
created: 2026-07-02
links:
  - "[[support-cases/synthetic-video-streaming/case-5813]]"
---

# Testing Convention

## Test ก่อนขึ้นจริง

logic ที่กระทบ bitrate ladder หรือ codec selection ต้องมี test ครอบคลุมอุปกรณ์กลุ่มที่ไม่รองรับ codec ใหม่เสมอก่อน merge — บทเรียนจาก [[support-cases/synthetic-video-streaming/case-5813]] คือ test ที่ไม่ครอบคลุม backward compatibility เจอ bug ไม่ทัน

## Concurrent test

ฟังก์ชันที่แตะการหยิบ job จากคิวต้องมี test จำลอง worker พร้อมกันอย่างน้อย 2 ตัวเสมอ
