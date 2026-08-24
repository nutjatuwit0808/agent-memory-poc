---
layer: business-logic
tags: [buddy, policy]
created: 2025-12-07
links:
  - "[[structure/synthetic-hr-onboarding/module-buddy-matching]]"
  - "[[business-logic/synthetic-hr-onboarding/buddy-assignment-policy-edge-cases]]"
---

# นโยบายเงื่อนไขการจับคู่ Buddy

[[structure/synthetic-hr-onboarding/module-buddy-matching]] เลือก buddy จาก department เดียวกันหรือใกล้เคียงก่อนเสมอ และต้องมี timezone overlap อย่างน้อย 4 ชั่วโมงกับพนักงานใหม่ เพื่อให้นัดคุยกันได้จริงในเวลาทำงานปกติ

buddy หนึ่งคนรับดูแลพนักงานใหม่พร้อมกันได้ไม่เกิน 2 คนในช่วงเวลาเดียวกัน — ถ้าเกินนี้ `findCandidateBuddies` จะไม่เสนอชื่อนั้นแม้เงื่อนไขอื่นจะตรงหมด

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-hr-onboarding/buddy-assignment-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
