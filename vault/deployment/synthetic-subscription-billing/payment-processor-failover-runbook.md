---
layer: deployment
tags: [dunning, runbook]
created: 2026-04-28
links:
  - "[[structure/synthetic-subscription-billing/module-dunning-engine]]"
---

# Payment Processor Failover Runbook

ขั้นตอนเมื่อ payment processor ภายนอกล่มหรือตอบสนองช้าผิดปกติ ต้องมีแผนสำรองเพราะกระทบกระบวนการ dunning และการเรียกเก็บเงินโดยตรง

## การตรวจจับ

monitor response time และ error rate ของ [[structure/synthetic-subscription-billing/module-dunning-engine]] ต่อ payment processor ภายนอก ถ้า error rate เกิน 15% ใน 5 นาที ให้ยกระดับเป็น Sev2 ทันที

## แผนสำรอง

การ retry ที่กำลังดำเนินอยู่จะถูก queue ไว้รอ ไม่ยกเลิกทิ้งอัตโนมัติ เพื่อไม่ให้ลูกค้าถูกระงับบริการเร็วเกินจริงเพียงเพราะ payment processor มีปัญหาชั่วคราว ไม่ใช่เพราะลูกค้าไม่ชำระเงินจริง
