---
layer: deployment
tags: [integration, webhook, runbook]
created: 2026-06-07
links:
  - "[[support-cases/synthetic-supply-chain/case-2860]]"
---

# Supplier API & Webhook Integration Runbook

ขั้นตอนสำหรับ onboard ซัพพลายเออร์ใหม่เข้าสู่ระบบ webhook และ API integration รวมถึงการตรวจสอบว่า integration ทำงานปกติอยู่เสมอ

## การ setup webhook สำหรับซัพพลายเออร์ใหม่

ทดสอบ webhook ด้วย test event ก่อน go-live เสมอ ตรวจสอบว่าซัพพลายเออร์ส่ง idempotency key มาด้วยทุก event และ retry ด้วย key เดิม ไม่ใช่ generate ใหม่ แจ้งซัพพลายเออร์เรื่อง rate limit ของ webhook endpoint ล่วงหน้า

## Health check สำหรับ webhook ที่ active อยู่

ทุกซัพพลายเออร์ที่ integrate ผ่าน webhook ต้องมี heartbeat event อย่างน้อย 1 ครั้งต่อ 24 ชั่วโมง ถ้าไม่มีให้ alert เพื่อตรวจสอบ บทเรียนจาก [[support-cases/synthetic-supply-chain/case-2860]] คือการรอ event โดยไม่มี fallback ทำให้ไม่รู้ว่า integration พัง
