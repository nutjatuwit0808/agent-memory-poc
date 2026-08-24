---
layer: convention
tags: [testing, integration]
created: 2026-08-12
links:
  - "[[support-cases/synthetic-marketing-automation/case-7351]]"
---

# Testing Convention

## Mock ESP เสมอใน test

test ที่แตะการส่งจริงต้อง mock ESP response ทุกกรณี (success, bounce, blacklist) ห้ามยิงอีเมลจริงแม้แต่ใน staging environment โดยเด็ดขาด

## Timezone test

logic ที่เกี่ยวกับ `sendAt` ต้องมี test ครอบคลุมอย่างน้อย 3 timezone ที่ต่างกัน — บทเรียนจาก [[support-cases/synthetic-marketing-automation/case-7351]]
