---
layer: convention
tags: [testing, integration]
created: 2026-01-09
links:
  - "[[support-cases/synthetic-hr-onboarding/case-5546]]"
---

# Testing Convention

## Mock vendor เสมอใน unit test

test ที่แตะ e-signature หรือ background check vendor ต้อง mock response ทุกกรณี (success, timeout, malformed payload) ห้ามยิง request จริงแม้แต่ใน staging environment

## Concurrent test

ฟังก์ชันที่แตะ task generation ต้องมี test จำลอง event ซ้ำ (duplicate delivery) อย่างน้อย 1 เคสเสมอ — บทเรียนจาก [[support-cases/synthetic-hr-onboarding/case-5546]]
