---
layer: deployment
tags: [migration, runbook]
created: 2026-03-23
---

# Database Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อ schema ของตาราง `assets`, `depreciation_schedules`, หรือ `disposal_records` เปลี่ยน ต้องรัน migration script ในช่วงนอก business hour เพราะ table เหล่านี้มีการ read/write ตลอด

## ขั้นตอน

1) backup database ก่อนเสมอ 2) รัน migration บน staging ก่อนและ verify ด้วยข้อมูลจำลอง 3) รัน production ในช่วงที่กำหนด 4) ยืนยันข้อมูลหลัง migrate ด้วย checksum
