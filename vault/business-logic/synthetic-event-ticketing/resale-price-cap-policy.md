---
layer: business-logic
tags: [resale, policy]
created: 2025-10-01
links:
  - "[[business-logic/synthetic-event-ticketing/resale-price-cap-policy-edge-cases]]"
---

# นโยบายเพดานราคาขายต่อ

ราคาขายต่อบนตลาด resale อย่างเป็นทางการต้องไม่เกิน `RESALE_PRICE_CAP_MULTIPLIER` เท่าของราคาบัตรเดิม เพื่อป้องกันการเก็งกำไรและปกป้องผู้ซื้อรายย่อยจากราคาที่สูงเกินจริง

ระบบปฏิเสธการลงขายที่ราคาเกินเพดานทันทีตั้งแต่ขั้นตอน `listForResale` ไม่ปล่อยให้ลงขายแล้วค่อยตรวจสอบทีหลัง เพื่อไม่ให้ผู้ขายเสียเวลารอโดยเปล่าประโยชน์

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-event-ticketing/resale-price-cap-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
