---
layer: structure
tags: [payment, reference, identifiers]
created: 2026-01-27
links:
  - "[[structure/module-payment]]"
---

# Payment Module — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด payment-service สำหรับคนที่ grep หา identifier ตรงๆ

## Public functions

- `chargePayment(orderId: string, amount: number, method: PaymentMethod): Promise<PaymentResult>`
- `verifyPayment(paymentId: string): Promise<PaymentStatus>`
- `retryPayment(paymentId: string): Promise<PaymentResult>`
- `reversePayment(paymentId: string, amount: number): Promise<ReversalResult>` — endpoint ภายในที่ refund-service เรียก

## Internal constants

- `MAX_RETRY_ATTEMPTS = 3`
- `GATEWAY_TIMEOUT_MS = 30000`
- `SUPPORTED_METHODS = ["card", "promptpay", "truemoney"]`

## Type

```ts
interface PaymentResult {
  paymentId: string;
  status: "success" | "failed" | "pending";
  gatewayRef: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/payment-retry-policy]]
