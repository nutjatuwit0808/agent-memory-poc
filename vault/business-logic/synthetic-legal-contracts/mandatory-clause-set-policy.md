---
layer: business-logic
tags: [template, policy]
created: 2026-03-05
links:
  - "[[structure/synthetic-legal-contracts/module-template-engine]]"
  - "[[business-logic/synthetic-legal-contracts/mandatory-clause-set-policy-edge-cases]]"
---

# นโยบายเงื่อนไขบังคับตามประเภทสัญญา

สัญญาแต่ละประเภท (จ้างงาน, จัดซื้อ, ความร่วมมือ, การรักษาความลับ) มีชุด clause บังคับที่ต้องมีอยู่เสมอ — [[structure/synthetic-legal-contracts/module-template-engine]] จะปฏิเสธการ publish template ที่ขาด clause บังคับของประเภทนั้นตั้งแต่ต้นทาง

การลบ clause บังคับออกจากสัญญาที่กำลังร่างอยู่ทำไม่ได้ผ่าน UI ปกติ ต้องขออนุมัติพิเศษจากทีมกฎหมายส่วนกลางเท่านั้น เพื่อป้องกันการลบเงื่อนไขสำคัญโดยไม่ตั้งใจระหว่างการเจรจา

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-legal-contracts/mandatory-clause-set-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
