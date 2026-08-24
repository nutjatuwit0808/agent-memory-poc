---
layer: structure
tags: [buddy, module]
created: 2026-02-22
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
  - "[[business-logic/synthetic-hr-onboarding/buddy-assignment-policy]]"
---

# Module: buddy-matching

จับคู่พนักงานใหม่กับ buddy/mentor ที่มีอยู่แล้วในทีมใกล้เคียง พิจารณาจาก department, timezone overlap, และภาระ buddy ปัจจุบันของแต่ละคนเพื่อไม่ให้คนเดิมถูกเลือกซ้ำถี่เกินไป

## ฟังก์ชันหลัก
- `findCandidateBuddies(hireId: string): Promise<BuddyCandidate[]>` — คืนรายชื่อ buddy ที่เป็นไปได้เรียงตามคะแนนความเหมาะสม
- `assignBuddy(hireId: string, buddyId: string): Promise<void>` — ยืนยันการจับคู่ buddy ให้ case นี้
- `reportBuddyLoad(buddyId: string): Promise<number>` — คืนจำนวนพนักงานใหม่ที่ buddy คนนี้กำลังดูแลอยู่ตอนนี้

## ความสัมพันธ์กับ module อื่น

ทำงานแบบ best-effort ไม่ block stage อื่นของ [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] — ถ้าจับคู่ buddy ไม่ได้ทันวันเริ่มงาน พนักงานยังเริ่มงานได้ตามปกติ เพียงแต่ยังไม่มี buddy ดู [[business-logic/synthetic-hr-onboarding/buddy-assignment-policy]] สำหรับเงื่อนไขการจับคู่
