---
layer: business-logic
tags: [inventory, policy]
created: 2026-04-19
links:
  - "[[business-logic/synthetic-event-ticketing/hold-expiry-timeout-policy-edge-cases]]"
---

# นโยบายระยะเวลาหมดอายุการจองชั่วคราว

ที่นั่งที่ถูก hold ระหว่างขั้นตอนชำระเงินจะหมดอายุอัตโนมัติภายใน `SEAT_HOLD_DEFAULT_TTL_SECONDS` วินาทีถ้าไม่มีการยืนยันการชำระเงินสำเร็จ เพื่อไม่ให้ที่นั่งถูกกันไว้นานเกินไปโดยไม่มีการซื้อจริง

การหมดอายุของ hold ต้องปล่อยที่นั่งกลับเป็น available ทันทีที่ TTL ครบ ไม่มีช่วงเวลา 'buffer' เพิ่มเติม เพราะจะทำให้ที่นั่งดูเหมือนขายไม่ได้ทั้งที่จริงว่างอยู่

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-event-ticketing/hold-expiry-timeout-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
