---
layer: structure
tags: [records, module, core, reference, identifiers]
created: 2026-02-15
links:
  - "[[structure/synthetic-health-records/module-patient-record-store]]"
  - "[[business-logic/synthetic-health-records/patient-record-amendment-policy]]"
---

# patient-record-store — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด patient-record-store สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-health-records/module-patient-record-store]])

## Public functions
- `getRecord(patientId: string, requesterId: string): Promise<PatientRecord>` — ดึงข้อมูลปัจจุบัน ต้องผ่านการตรวจสิทธิ์ก่อนเสมอ
- `amendRecord(patientId: string, changes: RecordChanges, amendedBy: string): Promise<string>` — แก้ไขข้อมูล สร้างเวอร์ชันใหม่โดยไม่ลบเวอร์ชันเดิม คืน versionId
- `getRecordHistory(patientId: string): Promise<RecordVersion[]>` — คืนประวัติการแก้ไขทั้งหมดของผู้ป่วยรายนั้น

## Internal constants
- `RECORD_VERSION_RETENTION_YEARS = 10`
- `MAX_CONCURRENT_AMENDMENT_RETRY = 3`

## Type

```ts
interface PatientRecord {
  patientId: string;
  currentVersionId: string;
  demographics: Demographics;
  lastAmendedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-health-records/patient-record-amendment-policy]]
