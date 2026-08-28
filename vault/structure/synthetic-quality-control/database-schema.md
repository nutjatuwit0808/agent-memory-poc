---
layer: structure
tags: [quality-control, qualitypulse, database, schema]
created: 2026-04-06
links:
  - "[[structure/synthetic-quality-control/module-measurement-collector]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-quality-control/module-measurement-collector]] ดูแล ได้แก่ `measurements` (ข้อมูลวัดดิบพร้อม timestamp และ instrument_id), `instruments` (ทะเบียนเครื่องมือวัดและสถานะการ calibration), และ `production_runs`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `measurements` | measurement-collector | เก็บตลอด ไม่ลบ ใช้วิเคราะห์ trend ย้อนหลัง |
| `spc_results` | spc-analyzer | ผล control chart แต่ละจุด พร้อม rule violation |
| `batches` | batch-inspector | สถานะ batch ปัจจุบัน (pending/pass/rework/quarantine) |
| `certifications` | certification-generator | ใบรับรองที่ออกแล้ว พร้อม checksum |
| `quarantine_holds` | quarantine-manager | hold ที่ active อยู่ พร้อม reason และ expiry |

ทุกตารางใช้ `batch_id` เป็น key ร่วมกันแบบ soft reference ตรวจสอบความสอดคล้องด้วย reconciliation job รายกะแทน FK constraint ข้าม database จริง
