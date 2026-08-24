---
layer: convention
tags: [review, quality]
created: 2026-03-20
links:
  - "[[support-cases/synthetic-social-feed/case-5698]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แตะ dedup หรือ rate limit ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-social-feed/case-5698]]) และการเปลี่ยน cache key ต้องมีคนที่สองยืนยันว่า invalidate ครบทุกจุด
