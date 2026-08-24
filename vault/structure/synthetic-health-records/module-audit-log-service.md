---
layer: structure
tags: [audit, compliance, module]
created: 2026-08-12
links:
  - "[[structure/synthetic-health-records/queue-architecture]]"
---

# Module: audit-log-service

บันทึกทุก action ที่เกี่ยวกับข้อมูลผู้ป่วยแบบ append-only แก้ไขหรือลบย้อนหลังไม่ได้แม้แต่โดย admin สูงสุด เป็นแหล่งข้อมูลหลักสำหรับการตรวจสอบ compliance และการสืบสวนกรณีสงสัยการเข้าถึงที่ไม่เหมาะสม

## ฟังก์ชันหลัก
- `recordAccess(providerId: string, patientId: string, action: string): Promise<void>` — บันทึกการเข้าถึงหรือแก้ไขข้อมูล 1 ครั้ง
- `queryAuditTrail(patientId: string, dateRange: DateRange): Promise<AuditEvent[]>` — ดึงประวัติการเข้าถึงข้อมูลผู้ป่วยรายหนึ่งสำหรับการตรวจสอบ
- `detectAnomalousAccess(providerId: string): Promise<AnomalyReport[]>` — วิเคราะห์ pattern การเข้าถึงที่ผิดปกติของแพทย์คนหนึ่ง

## ความสัมพันธ์กับ module อื่น

ไม่มี service ไหนเขียนตรงเข้าตาราง `audit_events` ได้นอกจาก audit-log-service เอง — service อื่นส่งผ่าน event เท่านั้น (ดู [[structure/synthetic-health-records/queue-architecture]]) เพื่อรักษาความสมบูรณ์ของ audit trail ไม่ให้ถูกแก้ไขจากทางลัด
