---
layer: structure
tags: [workflow, module, core]
created: 2025-10-25
links:
  - "[[business-logic/synthetic-hr-onboarding/day-one-access-policy]]"
  - "[[structure/synthetic-hr-onboarding/module-document-collection]]"
  - "[[structure/synthetic-hr-onboarding/module-access-provisioning]]"
  - "[[structure/synthetic-hr-onboarding/module-compliance-tracker]]"
---

# Module: onboarding-workflow-engine

state machine หลักที่ track ว่าพนักงานใหม่แต่ละคนอยู่ขั้นตอนไหนของ onboarding ตั้งแต่ตอบรับ offer จนถึง active วันแรก แยกออกมาเป็น service อิสระตั้งแต่ต้นปี 2025 เพราะเดิม logic นี้ฝังอยู่ใน admin console โดยตรง ทำให้แก้ workflow ทีต้อง deploy frontend ใหม่ทุกครั้ง

## ฟังก์ชันหลัก
- `startOnboarding(hireId: string, startDate: string, roleId: string): Promise<OnboardingCase>` — สร้าง case ใหม่และ trigger event เริ่มต้นให้ทุก service ย่อยสร้าง task/เอกสาร/compliance item ของตัวเอง
- `advanceStage(hireId: string, fromStage: OnboardingStage, toStage: OnboardingStage): Promise<void>` — ขยับ case ไป stage ถัดไป ตรวจก่อนว่าเงื่อนไขของ stage ปัจจุบันครบหรือยัง
- `getCaseStatus(hireId: string): Promise<OnboardingCase>` — คืนสถานะรวมของ case พร้อมสรุปว่า blocker ที่เหลืออยู่คืออะไร
- `pauseCase(hireId: string, reason: string): Promise<void>` — หยุด case ชั่วคราว เช่น พนักงานเลื่อนวันเริ่มงาน

## State

invited → documents_pending → background_check_pending → provisioning_pending → active — ดู [[business-logic/synthetic-hr-onboarding/day-one-access-policy]] สำหรับเงื่อนไขว่า stage ไหนต้องเสร็จก่อนวันเริ่มงาน

## ความสัมพันธ์กับ module อื่น

ไม่รู้จัก business rule ของ vendor ภายนอกเลย (เช่น background check ใช้เวลากี่วัน) — แค่รอ event `*.completed` หรือ `*.failed` จาก [[structure/synthetic-hr-onboarding/module-document-collection]], [[structure/synthetic-hr-onboarding/module-access-provisioning]], [[structure/synthetic-hr-onboarding/module-compliance-tracker]] แล้วตัดสินใจขยับ stage ตามนั้น เพื่อรักษาหลัก separation of concerns
