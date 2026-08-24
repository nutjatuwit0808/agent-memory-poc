---
layer: structure
tags: [provisioning, module, core]
created: 2026-06-20
links:
  - "[[business-logic/synthetic-hr-onboarding/day-one-access-policy]]"
  - "[[structure/synthetic-hr-onboarding/module-task-assignment]]"
---

# Module: access-provisioning

จัดสิทธิ์ laptop, software license, และ badge เข้าอาคารให้พนักงานใหม่ คุยกับระบบ ticketing ของทีม IT และระบบ badge ผ่านคิวเสมอ ไม่เรียกแบบ synchronous เพราะทั้งสองระบบภายนอกมี SLA ตอบสนองที่ไม่แน่นอน (นาทีถึงชั่วโมง)

## ฟังก์ชันหลัก
- `provisionAccess(hireId: string, accessBundleId: string): Promise<ProvisionRequest>` — ยื่นคำขอสิทธิ์ทั้งชุดตาม role (laptop, software, badge) เข้าคิว
- `revokeAccess(hireId: string, reason: string): Promise<void>` — เพิกถอนสิทธิ์ทั้งหมด เช่น กรณีพนักงานยกเลิกก่อนเริ่มงาน
- `checkProvisionStatus(hireId: string): Promise<ProvisionStatus>` — คืนสถานะการจัดสิทธิ์แต่ละรายการใน bundle

## State

queued → dispatched → confirmed | failed — ดู [[business-logic/synthetic-hr-onboarding/day-one-access-policy]] สำหรับ deadline ว่า `dispatched` ต้องเกิดก่อนวันเริ่มงานกี่วัน

## ความสัมพันธ์กับ module อื่น

ไม่รู้จัก concept ของ "task" หรือ "เอกสาร" เลย รู้แค่ว่า bundle สิทธิ์ไหนสำเร็จหรือพลาด — [[structure/synthetic-hr-onboarding/module-task-assignment]] เป็นคนแปลผล `access.provisioned` เป็น task ที่เสร็จเอง
