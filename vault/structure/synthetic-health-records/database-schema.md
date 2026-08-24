---
layer: structure
tags: [health-records, vitalchart, database, schema]
created: 2025-09-15
links:
  - "[[structure/synthetic-health-records/module-patient-record-store]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-health-records/module-patient-record-store]] ดูแล ได้แก่ `patient_records` (ข้อมูลปัจจุบัน), `patient_record_versions` (ประวัติการแก้ไขทุกเวอร์ชัน ไม่ลบทิ้ง), และ `care_relationships`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `patient_records` | patient-record-store | ข้อมูลปัจจุบันเท่านั้น |
| `patient_record_versions` | patient-record-store | เก็บทุกเวอร์ชันที่เคยแก้ไข append-only |
| `prescriptions` | prescription-manager | ไม่มี FK ไป patient_records ตรงๆ ใช้ patientId แบบ soft reference |
| `audit_events` | audit-log-service | append-only ห้าม update/delete แม้แต่ admin สูงสุด |

ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวันแทน (เช่น เช็คว่าทุก prescription มี patientId ที่มีอยู่จริงใน patient_records)
