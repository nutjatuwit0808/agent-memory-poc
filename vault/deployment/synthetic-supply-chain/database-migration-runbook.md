---
layer: deployment
tags: [migration, runbook, database]
created: 2025-10-15
---

# Database Migration Runbook

## ก่อน migrate

snapshot database ทุก service ที่ได้รับผลกระทบ และตรวจสอบว่าไม่มี in-flight transaction ค้างอยู่ PO ที่อยู่ระหว่าง state transition ต้องให้เสร็จก่อนเริ่ม migration

## ขั้นตอน

1) หยุดรับ order ใหม่จาก ERP ชั่วคราว 2) drain in-flight PO ให้หมด 3) run migration script 4) validate ด้วย smoke test ครอบคลุม create PO → receive goods flow 5) เปิดรับ order อีกครั้ง
