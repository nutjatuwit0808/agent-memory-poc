---
layer: structure
tags: [workflow, module, core, reference, identifiers]
created: 2026-02-16
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
  - "[[business-logic/synthetic-hr-onboarding/day-one-access-policy]]"
---

# onboarding-workflow-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด onboarding-workflow-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]])

## Public functions
- `startOnboarding(hireId: string, startDate: string, roleId: string): Promise<OnboardingCase>` — สร้าง case ใหม่และ trigger event เริ่มต้นให้ทุก service ย่อยสร้าง task/เอกสาร/compliance item ของตัวเอง
- `advanceStage(hireId: string, fromStage: OnboardingStage, toStage: OnboardingStage): Promise<void>` — ขยับ case ไป stage ถัดไป ตรวจก่อนว่าเงื่อนไขของ stage ปัจจุบันครบหรือยัง
- `getCaseStatus(hireId: string): Promise<OnboardingCase>` — คืนสถานะรวมของ case พร้อมสรุปว่า blocker ที่เหลืออยู่คืออะไร
- `pauseCase(hireId: string, reason: string): Promise<void>` — หยุด case ชั่วคราว เช่น พนักงานเลื่อนวันเริ่มงาน

## Internal constants
- `MAX_STAGE_RETRY = 2`
- `STAGE_TRANSITION_TIMEOUT_HOURS = 48`

## Type

```ts
interface OnboardingCase {
  hireId: string;
  stage: "invited" | "documents_pending" | "background_check_pending" | "provisioning_pending" | "active" | "stuck" | "paused";
  startDate: string;
  blockers: string[];
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่องเงื่อนไขวันเริ่มงานที่ [[business-logic/synthetic-hr-onboarding/day-one-access-policy]]
