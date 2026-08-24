---
layer: business-logic
tags: [pricing, floor, policy]
created: 2026-05-27
links:
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
  - "[[support-cases/synthetic-ad-bidding/case-1830]]"
  - "[[business-logic/synthetic-ad-bidding/floor-price-policy-edge-cases]]"
---

# นโยบาย Floor Price

SSP แต่ละรายกำหนด floor price (ราคาต่ำสุดที่ยอมรับ) มาพร้อมกับ bid request — [[structure/synthetic-ad-bidding/module-auction-engine]] ต้องเรียก `applyFloorPrice` เสมอก่อนส่งราคาสุดท้ายออกไป ถ้าราคาที่คำนวณได้ต่ำกว่า floor ระบบจะไม่ส่งราคาที่ต่ำกว่าออกไปเด็ดขาด (ส่ง no-bid แทน)

floor price ที่ SSP ส่งมาไม่ได้ถูกต้องเสมอไป — บาง SSP ส่งค่าที่สูงผิดปกติเป็นครั้งคราวเพราะบั๊กฝั่งเขาเอง ระบบจึงมีเพดานบนที่ยอมรับ (ไม่เกิน `FLOOR_PRICE_SANITY_MULTIPLIER` เท่าของราคาเฉลี่ยที่เคยชนะสำหรับ placement เดียวกัน) ถ้าเกินเพดานนี้จะถือว่า floor ผิดปกติและใช้ค่าเฉลี่ยแทน

## ความเสี่ยงถ้าไม่มีเพดานตรวจสอบ floor

เคยมีเหตุการณ์ที่ SSP รายหนึ่งส่ง floor price ผิดสูงกว่าปกติหลายสิบเท่าเพราะบั๊กหน่วยเงิน (ส่งเป็นหน่วยที่เล็กกว่าที่ตกลงกันไว้) ถ้า auction-engine เชื่อค่านั้นตรงๆ จะทำให้แคมเปญแทบทุกตัวถูกดันราคาสูงเกินจริงจนใช้ budget หมดเร็วผิดปกติ ดู [[support-cases/synthetic-ad-bidding/case-1830]]

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-ad-bidding/floor-price-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
