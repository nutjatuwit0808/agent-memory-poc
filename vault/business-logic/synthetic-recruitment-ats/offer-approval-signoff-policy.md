---
layer: business-logic
tags: [offer, approval, policy]
created: 2026-06-10
links:
  - "[[structure/synthetic-recruitment-ats/module-offer-approval-workflow]]"
  - "[[business-logic/synthetic-recruitment-ats/offer-approval-signoff-policy-edge-cases]]"
---

# นโยบายการเซ็นอนุมัติก่อนส่ง Offer

[[structure/synthetic-recruitment-ats/module-offer-approval-workflow]] ต้องได้รับ `recordApproval` แบบ `approved` จากทุกคนใน approval chain ก่อนที่ `sendOfferLetter` จะทำงานได้เสมอ ไม่มีข้อยกเว้นเรื่องความเร่งด่วน

approval chain กำหนดตามระดับเงินเดือน: ต่ำกว่าเพดานที่กำหนดต้องมี hiring manager คนเดียวอนุมัติพอ สูงกว่าเพดานต้องเพิ่ม VP ระดับสายงานเข้ามาเซ็นด้วยเสมอ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-recruitment-ats/offer-approval-signoff-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
