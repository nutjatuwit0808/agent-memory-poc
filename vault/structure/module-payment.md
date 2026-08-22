---
layer: structure
tags: [payment, module, gateway]
created: 2026-01-08
links:
  - "[[structure/overview-architecture]]"
  - "[[structure/module-refund]]"
  - "[[deployment/env-variables-reference]]"
---

# Module: payment-service

รับผิดชอบการชำระเงินขาเข้าทั้งหมด เชื่อมต่อ payment gateway ภายนอก (Omise เป็นหลัก, 2C2P เป็น fallback)

## ฟังก์ชันหลัก

- `chargePayment(orderId, amount, method)` — เรียก gateway เพื่อตัดเงิน คืน `PaymentResult`
- `verifyPayment(paymentId)` — เช็คสถานะการชำระเงินย้อนหลัง ใช้ตอน webhook มาช้าหรือหาย
- `retryPayment(paymentId)` — เรียกซ้ำเมื่อ gateway timeout ดูนโยบาย retry ที่ [[business-logic/payment-retry-policy]]

## Environment variables ที่ module นี้ใช้

`PAYMENT_GATEWAY_API_KEY`, `PAYMENT_GATEWAY_URL`, `PAYMENT_GATEWAY_TIMEOUT_MS` — รายละเอียดค่า default ดูที่ [[deployment/env-variables-reference]]

## ความสัมพันธ์กับ refund-service

payment-service ไม่รู้จัก concept "refund" เลย — เมื่อ refund-service ต้องการคืนเงินจะเรียก `chargePayment` กลับด้านผ่าน endpoint `POST /internal/payments/:id/reverse` เท่านั้น การแยกแบบนี้ทำให้ business rule ของการคืนเงิน (ดู [[structure/module-refund]]) ไม่ปนกับ logic การตัดเงิน

## จุดที่เคยมีปัญหา

gateway timeout ที่ระดับ connection (30 วินาที ตามค่า config โครงสร้างพื้นฐาน) เป็นคนละเรื่องกับ retry policy ระดับ business — อย่าสับสนสองอย่างนี้เวลา debug
