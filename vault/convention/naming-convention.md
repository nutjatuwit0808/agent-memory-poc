---
layer: convention
tags: [naming, typescript, style]
created: 2026-01-12
links:
  - "[[convention/code-review-checklist]]"
---

# Naming Convention

ทีมใช้ TypeScript ทั้ง backend และ frontend กติกาตั้งชื่อมีดังนี้

## ตัวแปรและฟังก์ชัน

- `camelCase` สำหรับตัวแปรและฟังก์ชัน เช่น `processRefund`, `calculateLoyaltyPoints`
- ฟังก์ชันที่ return `Promise` ควรขึ้นต้นด้วยคำกริยาที่สื่อ async operation เช่น `fetchOrder`, `verifyPayment` ไม่ใช่ `getOrderAsync` (คำว่า Async ซ้ำซ้อนกับ type อยู่แล้ว)
- boolean ต้องขึ้นต้นด้วย `is` / `has` / `should` เช่น `isRefundEligible`, `hasPendingDispute`

## Class และ Type

- `PascalCase` สำหรับ class, interface, type เช่น `MemoryNote`, `PaymentGateway`
- ห้ามขึ้นต้น interface ด้วย `I` (เช่น `IPayment`) — ทีมเคยใช้แบบนี้ในโปรเจกต์เก่าแล้วอ่านยากเวลา type ซ้อนกันเยอะ

## ค่าคงที่และ Environment variable

- `SCREAMING_SNAKE_CASE` เช่น `REFUND_SERVICE_URL`, `PAYMENT_GATEWAY_API_KEY`
- ค่าคงที่ระดับ module ที่ไม่ใช่ config ให้ใช้ `SCREAMING_SNAKE_CASE` เหมือนกัน เช่น `MAX_RETRY_ATTEMPTS = 3`

## ไฟล์และโฟลเดอร์

- `kebab-case` เสมอ เช่น `module-payment.ts`, `refund-policy.md`
- ไฟล์ backend implementation ตั้งชื่อ `<name>.backend.ts`

ดู [[convention/code-review-checklist]] สำหรับ checklist ตอน review ว่าชื่อผ่านเกณฑ์นี้ไหม
