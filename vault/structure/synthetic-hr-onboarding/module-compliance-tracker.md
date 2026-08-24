---
layer: structure
tags: [compliance, module]
created: 2025-10-21
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
  - "[[business-logic/synthetic-hr-onboarding/compliance-training-deadline-policy]]"
---

# Module: compliance-tracker

ติดตาม deadline ของ training บังคับและ certification ที่พนักงานใหม่ต้องทำให้เสร็จภายในกรอบเวลาที่กำหนด (เช่น อบรมความปลอดภัยข้อมูลภายใน 30 วัน) ส่ง reminder และ escalate ไปหาหัวหน้างาน/ทีม compliance เมื่อใกล้หรือเลยกำหนด

## ฟังก์ชันหลัก
- `scheduleComplianceItem(hireId: string, itemType: string, dueDate: string): Promise<void>` — สร้างรายการ compliance ใหม่พร้อมกำหนดเส้นตาย
- `markCompleted(hireId: string, itemType: string): Promise<void>` — บันทึกว่า item นั้นทำเสร็จแล้ว มักถูกเรียกจาก LMS webhook
- `listOverdueItems(): Promise<ComplianceItem[]>` — คืนรายการที่เลยกำหนดทั้งหมด ใช้ในรายงานประจำสัปดาห์ของทีม compliance

## ความสัมพันธ์กับ module อื่น

ไม่ block การเริ่มงานของพนักงาน — [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] ไม่รอ compliance item ให้เสร็จก่อนขยับไป stage `active` เพราะ training บังคับส่วนใหญ่มี deadline หลังวันเริ่มงาน ดู [[business-logic/synthetic-hr-onboarding/compliance-training-deadline-policy]]
