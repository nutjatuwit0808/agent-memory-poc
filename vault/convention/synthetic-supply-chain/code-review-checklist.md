---
layer: convention
tags: [review, quality]
created: 2026-05-12
links:
  - "[[support-cases/synthetic-supply-chain/case-2725]]"
  - "[[support-cases/synthetic-supply-chain/case-1044]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ state ของ PO หรือ supplier status ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (บทเรียนจาก [[support-cases/synthetic-supply-chain/case-2725]]) และการเปลี่ยน config ที่กระทบ replenishment threshold ต้องมีคนที่สองยืนยันก่อน merge

## การ deploy config

ทุกครั้งที่เปลี่ยน threshold config เช่น MOQ override หรือ replenishment EOQ ต้องระบุ expiry date ให้ชัดเจนและทำ cleanup plan ก่อน merge บทเรียนจาก [[support-cases/synthetic-supply-chain/case-1044]]
