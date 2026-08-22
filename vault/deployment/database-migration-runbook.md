---
layer: deployment
tags: [database, migration, runbook]
created: 2026-02-18
links:
  - "[[deployment/rollback-procedure]]"
  - "[[structure/database-schema]]"
---

# Database Migration Runbook

## กติกาการเขียน migration

- ทุก migration ต้อง backward-compatible กับโค้ดเวอร์ชันก่อนหน้าอย่างน้อย 1 release เสมอ (เผื่อ rollback)
- ห้าม `DROP COLUMN` ใน migration เดียวกับที่โค้ดเลิกใช้ column นั้น — แยกเป็น 2 release: release แรกเลิกใช้ในโค้ด, release ถัดไปค่อยลบ column จริง
- migration ที่แตะตารางใหญ่ (`orders`, `payments`) ต้องรันนอกเวลา peak (หลัง 22:00) และมี DBA ดูสด

## ขั้นตอนรัน

1. รัน migration บน staging ก่อนเสมอ วัดเวลาที่ใช้จริง
2. ถ้า estimated time > 5 นาทีบนตารางใหญ่ ต้องใช้ online migration tool ไม่ใช่ lock ตารางตรงๆ
3. รันบน production ผ่าน migration job ที่แยกจาก deploy pipeline หลัก เพื่อควบคุมเวลาที่แน่นอน

## ความสัมพันธ์กับ rollback

ถ้าต้อง rollback โค้ดหลัง migration ไปแล้ว ให้ดู [[deployment/rollback-procedure]] หัวข้อ "ข้อควรระวัง" — migration ที่ไม่ backward-compatible คือสาเหตุอันดับ 1 ที่ rollback แล้วพังหนักกว่าเดิม

โครงสร้างตารางปัจจุบันดูที่ [[structure/database-schema]]
