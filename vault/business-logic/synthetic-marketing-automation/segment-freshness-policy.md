---
layer: business-logic
tags: [segment, freshness, policy]
created: 2025-12-28
links:
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
  - "[[business-logic/synthetic-marketing-automation/segment-freshness-policy-edge-cases]]"
---

# นโยบายความสดของ Segment Snapshot

[[structure/synthetic-marketing-automation/module-campaign-builder]] ต้องเช็ค `computedAt` ของ segment snapshot ก่อนอนุมัติ `validateCampaign` เสมอ — snapshot ที่เก่าเกิน 24 ชั่วโมงถือว่า stale และต้อง trigger `recomputeSegment` ใหม่ก่อนส่งได้

การไม่บังคับ freshness check จะทำให้ campaign ส่งไปหา contact ที่ไม่ตรงเงื่อนไขล่าสุดแล้ว (เช่น คนที่เพิ่งยกเลิกสมาชิกไปแล้วแต่ snapshot เก่ายังนับรวมอยู่) ซึ่งเป็นความเสี่ยงทั้งด้านประสบการณ์ลูกค้าและ compliance

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-marketing-automation/segment-freshness-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
