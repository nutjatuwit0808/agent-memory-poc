---
layer: structure
tags: [records, module, core]
created: 2026-06-19
links:
  - "[[business-logic/synthetic-health-records/patient-record-amendment-policy]]"
  - "[[structure/synthetic-health-records/module-audit-log-service]]"
---

# Module: patient-record-store

เจ้าของข้อมูลประวัติผู้ป่วยหลักทั้งหมด (ข้อมูลส่วนตัว, ประวัติการวินิจฉัย, บันทึกการตรวจ) เก็บทุกเวอร์ชันที่เคยแก้ไขไว้แบบ immutable เพื่อให้ตรวจสอบย้อนหลังได้เสมอว่าใครแก้อะไรตอนไหน แยกออกมาเป็น service อิสระตั้งแต่เริ่มโปรเจกต์เพราะเป็นข้อมูลที่ sensitive ที่สุดในระบบ

## ฟังก์ชันหลัก
- `getRecord(patientId: string, requesterId: string): Promise<PatientRecord>` — ดึงข้อมูลปัจจุบัน ต้องผ่านการตรวจสิทธิ์ก่อนเสมอ
- `amendRecord(patientId: string, changes: RecordChanges, amendedBy: string): Promise<string>` — แก้ไขข้อมูล สร้างเวอร์ชันใหม่โดยไม่ลบเวอร์ชันเดิม คืน versionId
- `getRecordHistory(patientId: string): Promise<RecordVersion[]>` — คืนประวัติการแก้ไขทั้งหมดของผู้ป่วยรายนั้น

## State

active → amended (สร้างเวอร์ชันใหม่) — เวอร์ชันเก่าไม่ถูกลบทิ้งเลย ดู [[business-logic/synthetic-health-records/patient-record-amendment-policy]]

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่ `getRecord` ถูกเรียก จะ publish event `record.accessed` ให้ [[structure/synthetic-health-records/module-audit-log-service]] บันทึกเสมอ ไม่มีทางเรียกดูข้อมูลโดยไม่ถูกบันทึกได้เลยแม้แต่ admin ระดับสูงสุด
