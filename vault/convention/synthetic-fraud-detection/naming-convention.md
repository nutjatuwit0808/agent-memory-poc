---
layer: convention
tags: [naming, style]
created: 2026-06-14
links:
  - "[[support-cases/synthetic-fraud-detection/case-7202]]"
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `scoreSignal`, `computeFingerprint` — ฟังก์ชันที่คืน boolean ขึ้นต้นด้วย `is`, `has`, `should` เสมอ เช่น `isTrustedDevice`, `hasVelocityBreach`

## Status enum

terminal status ทุกตัวต้อง explicit เช่น `closed`, `sla_breach`, `auto_approved` ห้ามใช้ status อื่นแทนกัน เพราะแต่ละ state มีความหมาย audit ต่างกัน (ดูบทเรียนจาก [[support-cases/synthetic-fraud-detection/case-7202]])
