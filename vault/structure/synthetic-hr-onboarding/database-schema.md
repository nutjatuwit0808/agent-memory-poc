---
layer: structure
tags: [hr-onboarding, onboardflow, database, schema]
created: 2025-11-16
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] ดูแล ได้แก่ `onboarding_cases` (สถานะปัจจุบันของแต่ละพนักงานใหม่) และ `stage_transition_log` (ประวัติการเปลี่ยน stage ทั้งหมด ไม่ลบทิ้งเพื่อ audit)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `onboarding_cases` | onboarding-workflow-engine | 1 แถวต่อพนักงานใหม่ 1 คน |
| `tasks` | task-assignment | checklist item ทั้งหมดต่อ case |
| `documents` | document-collection | สถานะเอกสารแต่ละประเภทต่อ case |
| `provision_requests` | access-provisioning | คำขอสิทธิ์อุปกรณ์/software/badge |
| `compliance_items` | compliance-tracker | deadline training/certification ต่อ case |

ทุกตารางใช้ `hireId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันแทน
