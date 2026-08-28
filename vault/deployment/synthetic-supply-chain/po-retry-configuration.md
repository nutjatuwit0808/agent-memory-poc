---
layer: deployment
tags: [retry, idempotency, configuration]
created: 2026-02-25
links:
  - "[[support-cases/synthetic-supply-chain/case-2725]]"
---

# PO API Retry & Idempotency Configuration

เอกสารนี้อธิบาย configuration ของ retry behavior และ idempotency key สำหรับ PO creation endpoint — บทเรียนจาก [[support-cases/synthetic-supply-chain/case-2725]] ทำให้ต้องกำหนดค่านี้อย่างระมัดระวัง

## Idempotency key

ERP integration ต้องส่ง `X-Idempotency-Key` header ทุก PO creation request โดยค่าต้องเป็น UUID v4 ที่ unique ต่อ request intent (ไม่ใช่ generate ใหม่ทุก retry) — server เก็บ key นี้ไว้ 24 ชั่วโมงและ return response เดิมถ้าพบ duplicate

## Retry policy สำหรับ client

Retry ไม่เกิน 3 ครั้ง backoff เริ่มที่ 1 วินาที × 2 (exponential) ถ้า timeout > 30 วินาที ต้องใช้ idempotency key เดิม ไม่ generate ใหม่ เพราะ request อาจถึง server แล้วแต่ response หายระหว่างทาง
