---
layer: convention
tags: [review, quality]
created: 2026-07-02
links:
  - "[[support-cases/synthetic-video-streaming/case-6679]]"
  - "[[support-cases/synthetic-video-streaming/case-8496]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้สถานะ job หรือ cache key logic ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-video-streaming/case-6679]]) และการเปลี่ยนค่า config ตัวเลข (bitrate, timeout) ต้องมีคนที่สองยืนยันก่อน merge เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-video-streaming/case-8496]])
