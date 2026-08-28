---
layer: deployment
tags: [partner, sync, runbook, deployment]
created: 2026-03-04
links:
  - "[[support-cases/synthetic-loyalty-rewards/case-3452]]"
---

# Partner Sync Deployment Runbook

ขั้นตอนสำหรับ onboard partner ใหม่หรืออัปเดต integration กับ partner เดิม

## Onboard partner ใหม่

1) ตั้ง conversion rate และ `partnerId` ในระบบ 2) ทดสอบ webhook ด้วย test transaction 3) ยืนยัน idempotency ด้วยการ replay test transaction ซ้ำ 4) เปิด production เฉพาะ partner นั้น

## อัปเดต integration เดิม

ต้องทดสอบ format validation กับ sample payload ใหม่ก่อน deploy บทเรียนจาก [[support-cases/synthetic-loyalty-rewards/case-3452]] คือ partner อาจเปลี่ยน format โดยไม่แจ้ง
