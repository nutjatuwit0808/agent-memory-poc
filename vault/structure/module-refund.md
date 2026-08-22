---
layer: structure
tags: [refund, module]
created: 2026-01-09
links:
  - "[[structure/module-payment]]"
  - "[[business-logic/refund-policy]]"
  - "[[deployment/env-variables-reference]]"
---

# Module: refund-service

แยกออกมาจาก payment-service ตั้งแต่ Q1 2025 เพราะกฎการคืนเงินซับซ้อนขึ้นเรื่อยๆ (ระยะเวลา, สิทธิ์ตาม tier ลูกค้า, การอนุมัติ)

## ฟังก์ชันหลัก

- `processRefund(orderId, reason)` — จุดเข้าเดียวสำหรับคำขอคืนเงินทั้งหมด ตรวจสิทธิ์ตาม [[business-logic/refund-policy]] แล้วเรียก payment-service เพื่อคืนเงินจริง
- `checkRefundEligibility(orderId)` — คืน `boolean` ว่า order นี้ยังอยู่ในเงื่อนไขคืนเงินได้ไหม
- `cancelPendingRefund(refundId)` — ยกเลิกคำขอที่ยังไม่ประมวลผล

## Environment variable

`REFUND_SERVICE_URL` — ใช้โดย service อื่นที่ต้อง call เข้ามา ดูค่า default ที่ [[deployment/env-variables-reference]]

## State ของ refund

`requested` → `approved` → `processing` → `completed` หรือ `failed`

ถ้า `processing` ค้างนานเกิน threshold (ปกติเกิดจาก payment gateway ไม่ตอบ) ระบบจะ mark เป็น `stuck` และแจ้งทีม support ให้เข้าไปดูเคสด้วยมือ — ปัญหานี้คือสิ่งที่ทำให้เกิด support case จำนวนมาก เช่น `support-cases/case-2891.md`

## ความสัมพันธ์กับ order

`processRefund` จะไม่แตะสถานะของ order โดยตรง — ปล่อยให้ order-service ฟัง event `refund.completed` แล้วอัปเดตสถานะ order เอง เพื่อรักษาหลัก "แต่ละ service เป็นเจ้าของ data ตัวเอง"
