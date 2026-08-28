---
layer: business-logic
tags: [assessment, passing-score, policy]
created: 2025-09-14
links:
  - "[[structure/synthetic-e-learning/module-course-catalog]]"
  - "[[structure/synthetic-e-learning/module-assessment-engine]]"
  - "[[structure/synthetic-e-learning/module-certificate-issuer]]"
  - "[[business-logic/synthetic-e-learning/passing-score-threshold-policy-edge-cases]]"
---

# นโยบายเกณฑ์คะแนนผ่านการประเมิน

แต่ละคอร์สกำหนด `passingScorePct` ไว้ใน course metadata ที่ [[structure/synthetic-e-learning/module-course-catalog]] จัดการ เกณฑ์ขั้นต่ำ default คือ 70% แต่คอร์สประเภท compliance หรือ safety อาจกำหนดสูงกว่า เช่น 80% หรือ 90% ขึ้นกับ regulatory requirement

[[structure/synthetic-e-learning/module-assessment-engine]] ตรวจคะแนนและ publish `assessment.graded` event ส่วน [[structure/synthetic-e-learning/module-certificate-issuer]] เป็นผู้ตัดสินใจสุดท้ายว่าผ่าน threshold ของคอร์สนั้นหรือไม่ เพราะ threshold อยู่ใน course metadata ไม่ใช่ใน assessment engine

## ทำไมไม่ hardcode threshold ใน assessment engine

Threshold เป็น business decision ที่ต่างกันแต่ละคอร์ส การ hardcode ใน assessment engine จะทำให้ต้องแก้ code ทุกครั้งที่ regulatory requirement เปลี่ยน แทนที่จะแก้ใน course configuration เพียงที่เดียว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-e-learning/passing-score-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
