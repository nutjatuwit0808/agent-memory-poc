---
layer: deployment
tags: [restaurant, integration, runbook]
created: 2026-07-24
links:
  - "[[support-cases/synthetic-food-delivery/case-8646]]"
---

# Restaurant Integration Runbook

## การ onboard ร้านใหม่

ร้านใหม่ต้องทดสอบ relay integration ใน staging environment ก่อน go-live อย่างน้อย 48 ชั่วโมง โดยส่ง dummy order อย่างน้อย 20 ออร์เดอร์และยืนยันว่า response time เฉลี่ยต่ำกว่า 60 วินาที

## การย้าย integration ของร้านเดิม

ถ้าร้านย้ายจาก tablet ตัวหนึ่งมา API integration ใหม่ ต้องทดสอบ parallel run ทั้งสอง channel พร้อมกันนาน 24 ชั่วโมงก่อน cutover จริง เพื่อป้องกัน [[support-cases/synthetic-food-delivery/case-8646]] ซ้ำ
