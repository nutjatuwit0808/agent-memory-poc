---
layer: business-logic
tags: [rate-limit, policy]
created: 2026-05-03
links:
  - "[[structure/synthetic-chat-support-bot/module-rate-limiter]]"
  - "[[business-logic/synthetic-chat-support-bot/rate-limit-policy-edge-cases]]"
---

# นโยบายการจำกัดอัตราข้อความ

[[structure/synthetic-chat-support-bot/module-rate-limiter]] ใช้ token bucket ต่อ `accountId` ความจุ `RATE_LIMIT_BUCKET_CAPACITY` (ค่าปกติ 30 ข้อความ) เติมคืน `RATE_LIMIT_REFILL_PER_MIN` โทเคนต่อนาที ข้อความที่มาเมื่อ bucket ว่างจะถูกปฏิเสธพร้อม error บอกเวลาที่ต้องรอ

การจำกัดอัตราทำงานแยกต่อ channel ด้วย ไม่ใช่รวมทุกช่องทางเข้า bucket เดียว เพราะลูกค้าที่คุยผ่านเว็บวิดเจ็ตและ LINE พร้อมกันไม่ควรถูกนับปนกันจนโดน throttle เร็วเกินจริง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-chat-support-bot/rate-limit-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
