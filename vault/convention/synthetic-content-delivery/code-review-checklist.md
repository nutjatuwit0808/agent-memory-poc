---
layer: convention
tags: [review, quality]
created: 2026-04-22
links:
  - "[[support-cases/synthetic-content-delivery/case-8297]]"
  - "[[support-cases/synthetic-content-delivery/case-3682]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แตะ cache key generation ต้องมี tenant_id เสมอ (บทเรียนจาก [[support-cases/synthetic-content-delivery/case-8297]]) และการเปลี่ยน propagation logic ต้องมี integration test ครอบคลุม edge case ของ concurrent request ก่อน merge

## Security checklist

การเปลี่ยน geo-restriction หรือ whitelist logic ต้องผ่าน security review จากทีม security engineer ก่อน merge เสมอ — บทเรียนจาก [[support-cases/synthetic-content-delivery/case-3682]]
