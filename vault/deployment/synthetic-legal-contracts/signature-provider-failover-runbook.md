---
layer: deployment
tags: [signature, runbook]
created: 2025-10-05
links:
  - "[[structure/synthetic-legal-contracts/module-signature-orchestrator]]"
  - "[[business-logic/synthetic-legal-contracts/signature-order-enforcement-policy]]"
---

# Signature Provider Failover Runbook

ขั้นตอนเมื่อ e-signature provider ภายนอกล่มหรือตอบสนองช้าผิดปกติ ต้องมีแผนสำรองเพราะกระทบกระบวนการเซ็นที่กำลังดำเนินอยู่โดยตรง

## การตรวจจับ

monitor response time ของ [[structure/synthetic-legal-contracts/module-signature-orchestrator]] ต่อ provider ภายนอก ถ้า error rate เกิน 10% ใน 5 นาที ให้ยกระดับเป็น Sev2 ทันที

## แผนสำรอง

signature request ที่กำลังดำเนินอยู่จะถูก queue ไว้รอ ไม่ยกเลิกทิ้งอัตโนมัติ เพราะการยกเลิกกลางคันอาจทำให้ลำดับการเซ็นเสียหายตาม [[business-logic/synthetic-legal-contracts/signature-order-enforcement-policy]] — ต้องรอ provider กลับมาทำงานปกติก่อนจึงส่ง request ที่ค้างอยู่ต่อ
