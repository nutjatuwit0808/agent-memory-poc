---
layer: business-logic
tags: [pipeline, automation, policy]
created: 2026-07-18
links:
  - "[[business-logic/synthetic-recruitment-ats/pipeline-auto-advance-policy-edge-cases]]"
---

# นโยบายการเลื่อนขั้น Pipeline อัตโนมัติ

บางขั้นใน pipeline อนุญาตให้ `advanceStage` ทำงานอัตโนมัติได้เมื่อเงื่อนไขที่กำหนดผ่านครบ เช่น ผ่านการสัมภาษณ์ทุกรอบและ interviewer ทุกคนให้ผลบวก แต่บางขั้น (เช่น จาก `interviewing` ไป `offer`) ต้องมี recruiter ยืนยันด้วยมือเสมอ ไม่ auto-advance

กติกาว่าขั้นไหน auto-advance ได้กำหนดไว้ล่วงหน้าต่อ requisition ไม่ใช่ default เดียวกันทั้งระบบ เพราะบางตำแหน่ง (เช่นตำแหน่งผู้บริหาร) ต้องการให้คนตัดสินใจทุกขั้นตอน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-recruitment-ats/pipeline-auto-advance-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
