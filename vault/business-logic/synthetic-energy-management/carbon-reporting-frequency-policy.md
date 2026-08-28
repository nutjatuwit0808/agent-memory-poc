---
layer: business-logic
tags: [carbon, policy]
created: 2026-08-12
links:
  - "[[business-logic/synthetic-energy-management/carbon-reporting-frequency-policy-edge-cases]]"
---

# นโยบายความถี่การรายงานคาร์บอนฟุตพรินต์

รายงานคาร์บอนฟุตพรินต์ต้องสร้างทุกเดือนสำหรับทุก facility โดยอัตโนมัติ ไม่รอให้ทีมความยั่งยืนร้องขอ เพื่อให้มีข้อมูลต่อเนื่องสำหรับการวิเคราะห์แนวโน้มระยะยาว

รายงานที่สร้างแล้วจะไม่ถูกคำนวณใหม่ย้อนหลังโดยอัตโนมัติแม้ emission factor จะเปลี่ยน เพื่อรักษาความสอดคล้องของตัวเลขในรายงานที่เผยแพร่ไปแล้ว การคำนวณใหม่ต้องทำผ่านขั้นตอนพิเศษที่ระบุชัดเจนว่าเป็นฉบับแก้ไข

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-energy-management/carbon-reporting-frequency-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
