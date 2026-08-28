---
layer: convention
tags: [git, workflow]
created: 2026-05-21
links:
  - "[[convention/synthetic-supply-chain/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SUPPLY-102-expedite-surcharge-causal-link`, `fix/SUPPLY-214-replenishment-loop-circuit-breaker`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-supply-chain/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
