---
layer: convention
tags: [testing, quality]
created: 2026-03-17
links:
  - "[[support-cases/synthetic-asset-management/case-4888]]"
  - "[[business-logic/synthetic-asset-management/disposal-certification-policy]]"
---

# Testing Convention

## Atomic operation test

ฟังก์ชันที่เปลี่ยนสถานะสินทรัพย์ทุกตัวต้องมี test จำลอง concurrent call อย่างน้อย 2 request พร้อมกัน — บทเรียนจาก [[support-cases/synthetic-asset-management/case-4888]]

## Compliance scenario test

กระบวนการ disposal ต้อง test ครบทุก certification path รวมถึง `data-bearing` vs `non-data-bearing` asset ดู [[business-logic/synthetic-asset-management/disposal-certification-policy]]
