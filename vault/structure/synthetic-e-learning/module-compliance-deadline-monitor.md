---
layer: structure
tags: [compliance, deadline, module]
created: 2025-09-16
links:
  - "[[business-logic/synthetic-e-learning/mandatory-compliance-deadline-policy]]"
  - "[[structure/synthetic-e-learning/module-certificate-issuer]]"
---

# Module: compliance-deadline-monitor

ติดตาม compliance training deadline ของพนักงานทุกคนตาม regulatory requirement ที่กำหนด แจ้งเตือนล่วงหน้า 30, 14, 7 วันก่อน deadline และ escalate ไปยัง manager เมื่อ deadline ใกล้มากหรือเลยไปแล้ว ระบบ sync สถานะ compliance กับ HR system ทุกวันเพื่อให้ HR รายงาน compliance ได้ถูกต้อง

## ฟังก์ชันหลัก
- `evaluateCompliance(learnerId: string, regulatoryFramework: string): Promise<ComplianceStatus>` — ประเมินสถานะ compliance ของผู้เรียนสำหรับ regulatory framework ที่ระบุ
- `scheduleDeadlineReminders(learnerId: string, courseId: string, deadline: string): Promise<void>` — ตั้ง reminder schedule ตาม [[business-logic/synthetic-e-learning/mandatory-compliance-deadline-policy]]
- `escalateOverdue(learnerId: string, courseId: string): Promise<void>` — ส่ง escalation ไปยัง manager และ HR เมื่อ deadline เลยไปแล้ว
- `generateComplianceReport(orgId: string, framework: string): Promise<ComplianceReport>` — สร้าง compliance report สรุปสถานะของพนักงานทุกคนใน org สำหรับ regulatory audit

## ความสัมพันธ์กับ module อื่น

Subscribe event `certificate.issued` จาก [[structure/synthetic-e-learning/module-certificate-issuer]] เพื่ออัปเดต compliance status อัตโนมัติโดยไม่ต้อง polling progress ทุกนาที และ sync ข้อมูลกับ HR system ผ่าน daily batch job ไม่ใช่ real-time เพราะ HR system ไม่รองรับ webhook
