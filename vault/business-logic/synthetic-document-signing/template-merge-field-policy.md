---
layer: business-logic
tags: [template, merge-field, policy]
created: 2026-03-11
links:
  - "[[business-logic/synthetic-document-signing/template-merge-field-policy-edge-cases]]"
---

# นโยบายการจัดการ Merge Field ที่ไม่ถูกกรอก

merge field ทุกตัวที่ประกาศไว้ใน template ต้องถูกกรอกค่าให้ครบก่อน `renderTemplate` จะสำเร็จ — ถ้ามี field ใดไม่ถูกส่งค่ามา ฟังก์ชันจะ throw error ทันที ไม่ render เอกสารที่มี placeholder ค้างออกไปให้ envelope-builder ใช้งานต่อเด็ดขาด

เหตุผลที่เข้มงวดขนาดนี้เพราะเอกสารที่มี placeholder ค้าง (เช่น `{{customer_name}}` ที่ไม่ถูกแทนที่) เคยถูกส่งออกไปให้ลูกค้าเซ็นจริงมาก่อน สร้างความเสียหายต่อความน่าเชื่อถือมากกว่าการ block ไม่ให้สร้าง envelope ได้ทันที

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-document-signing/template-merge-field-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
