---
layer: structure
tags: [access-control, module]
created: 2026-06-17
links:
  - "[[structure/synthetic-health-records/module-patient-record-store]]"
  - "[[business-logic/synthetic-health-records/emergency-access-break-glass-policy]]"
---

# Module: provider-access-control

ตัดสินใจว่าแพทย์/พยาบาลคนไหนเข้าถึงข้อมูลผู้ป่วยรายไหนได้บ้าง ผูกกับความสัมพันธ์การรักษาจริง (care relationship) ไม่ใช่แค่ role ทั่วไป เป็น service เดียวที่ทุก service อื่นต้อง query ก่อนคืนข้อมูลผู้ป่วยเสมอ

## ฟังก์ชันหลัก
- `checkAccess(providerId: string, patientId: string): Promise<AccessDecision>` — ตรวจสิทธิ์การเข้าถึงแบบ real-time ทุกครั้งที่มีการขอดูข้อมูล
- `grantCareRelationship(providerId: string, patientId: string, reason: string): Promise<void>` — สร้างความสัมพันธ์การรักษาใหม่เมื่อแพทย์เริ่มดูแลผู้ป่วยรายนั้น
- `revokeAccess(providerId: string, patientId: string): Promise<void>` — เพิกถอนสิทธิ์ทันทีเมื่อความสัมพันธ์การรักษาสิ้นสุด

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-health-records/module-patient-record-store]] เรียก `checkAccess` ก่อน `getRecord` ทุกครั้งไม่มีข้อยกเว้น ยกเว้นกรณี break-glass ที่ผ่านเงื่อนไขพิเศษของ [[business-logic/synthetic-health-records/emergency-access-break-glass-policy]]
