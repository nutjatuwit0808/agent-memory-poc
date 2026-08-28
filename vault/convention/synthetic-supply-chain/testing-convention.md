---
layer: convention
tags: [testing, integration]
created: 2026-03-24
links:
  - "[[support-cases/synthetic-supply-chain/case-2725]]"
  - "[[support-cases/synthetic-supply-chain/case-8395]]"
---

# Testing Convention

## Integration test กรณี concurrent

ฟังก์ชันที่สร้างหรือแก้ PO ต้องมี test จำลอง concurrent request อย่างน้อย 2 ตัวเพื่อตรวจจับ race condition บทเรียนจาก [[support-cases/synthetic-supply-chain/case-2725]] คือ timeout+retry scenario ต้องอยู่ใน test suite เสมอ

## Background job test

Sync job และ trigger loop ต้องมี test ครอบคลุมกรณี idempotency — รัน job ซ้ำ 2 ครั้งต้องให้ผลเดิม ตรวจสอบด้วยบทเรียนจาก [[support-cases/synthetic-supply-chain/case-8395]]
