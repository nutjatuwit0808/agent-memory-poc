---
layer: convention
tags: [review, quality]
created: 2026-05-06
links:
  - "[[support-cases/synthetic-ad-bidding/case-9755]]"
  - "[[support-cases/synthetic-ad-bidding/case-8741]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

โค้ดที่แตะ time budget ของ bid request ต้องแนบผลทดสอบ latency p99 มาด้วยเสมอ (บทเรียนจาก [[support-cases/synthetic-ad-bidding/case-9755]]) การเปลี่ยน fraud rule ต้องมีคนที่สองจากทีม trust & safety รีวิวก่อน merge เสมอ และการเปลี่ยน field ใน schema ที่ share ข้าม service ต้องระบุลำดับการ deploy ชัดเจน (ดูบทเรียนจาก [[support-cases/synthetic-ad-bidding/case-8741]])
