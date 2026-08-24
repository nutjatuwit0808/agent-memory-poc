---
layer: business-logic
tags: [maintenance, dedup, policy]
created: 2025-09-25
links:
  - "[[structure/synthetic-smart-building/module-maintenance-scheduler]]"
  - "[[business-logic/synthetic-smart-building/maintenance-work-order-dedup-policy-edge-cases]]"
---

# นโยบายกันสร้าง Work Order ซ้ำ

ก่อนสร้าง work order ใหม่ [[structure/synthetic-smart-building/module-maintenance-scheduler]] ต้องเรียก `dedupWorkOrder` เช็คก่อนเสมอว่ามี work order สถานะ `open` หรือ `assigned` สำหรับ fault category เดียวกันในโซนเดียวกันอยู่แล้วหรือไม่

ถ้าพบ work order ที่ยังเปิดอยู่ ระบบจะไม่สร้างใหม่ แต่จะเพิ่ม `occurrenceCount` และอัปเดต `lastSeenAt` บน work order เดิมแทน เพื่อให้ช่างเห็นว่า fault นี้เกิดซ้ำกี่ครั้งแล้วโดยไม่ต้องไล่ดูหลายใบ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-smart-building/maintenance-work-order-dedup-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
