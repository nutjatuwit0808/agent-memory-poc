---
layer: business-logic
tags: [dunning, policy]
created: 2026-05-01
links:
  - "[[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy-edge-cases]]"
---

# นโยบายตารางเวลา Retry การเรียกเก็บเงิน

เมื่อการชำระเงินล้มเหลว ระบบจะลองเรียกเก็บซ้ำสูงสุด `DUNNING_MAX_RETRY_COUNT` ครั้ง ห่างกันครั้งละ `DUNNING_RETRY_INTERVAL_DAYS` วัน ถ้าครบทุกรอบแล้วยังไม่สำเร็จจะระงับบริการอัตโนมัติ

ระหว่างกระบวนการ dunning ลูกค้ายังคงใช้บริการได้ตามปกติ ไม่ระงับทันทีตั้งแต่ครั้งแรกที่ชำระเงินล้มเหลว เพื่อไม่ให้ปัญหาชั่วคราว (เช่น บัตรหมดอายุพอดี) กระทบประสบการณ์ใช้งานทันที

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
