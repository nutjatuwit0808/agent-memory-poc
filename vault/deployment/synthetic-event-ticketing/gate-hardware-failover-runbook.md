---
layer: deployment
tags: [scanning, runbook]
created: 2025-11-12
links:
  - "[[support-cases/synthetic-event-ticketing/case-4132]]"
---

# Gate Hardware Failover Runbook

ขั้นตอนเมื่อเครื่องสแกนหน้างานเสียหรือ network หน้างานมีปัญหา ต้องมีแผนสำรองเพราะกระทบการเข้างานของผู้ชมจำนวนมากโดยตรง

## การตรวจจับ

monitor heartbeat ของเครื่องสแกนทุกตัวผ่าน `GATE_HEARTBEAT_INTERVAL_SEC` ถ้าเครื่องไหนขาดการติดต่อเกิน 3 รอบติดกันให้แจ้งทีมหน้างานทันที

## แผนสำรอง

เครื่องสแกนที่ network หลุดจะสลับไปใช้ cache offline อัตโนมัติตาม `SCANNER_OFFLINE_CACHE_TTL_MIN` — บทเรียนจาก [[support-cases/synthetic-event-ticketing/case-4132]] คือต้อง sync สถานะยกเลิกล่าสุดทันทีที่ network กลับมาเพื่อลดความเสี่ยงรับบัตรที่ถูกยกเลิกไปแล้ว
