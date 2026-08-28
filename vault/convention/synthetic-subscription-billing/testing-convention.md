---
layer: convention
tags: [testing, quality]
created: 2026-06-30
links:
  - "[[support-cases/synthetic-subscription-billing/case-9086]]"
  - "[[support-cases/synthetic-subscription-billing/case-8940]]"
  - "[[support-cases/synthetic-subscription-billing/case-5434]]"
---

# Testing Convention

## Idempotency test

ฟังก์ชันที่มีผลกระทบทางการเงินต้องมี test ยืนยันว่าเรียกซ้ำแล้วไม่เรียกเก็บเงินซ้ำเสมอ — บทเรียนจาก [[support-cases/synthetic-subscription-billing/case-9086]]

## Timezone test

ฟังก์ชันที่คำนวณวันที่หรือรอบบิลต้องมี test เทียบข้าม timezone เสมอ — บทเรียนจาก [[support-cases/synthetic-subscription-billing/case-8940]] และ [[support-cases/synthetic-subscription-billing/case-5434]]
