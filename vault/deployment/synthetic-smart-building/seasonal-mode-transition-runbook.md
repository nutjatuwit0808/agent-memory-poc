---
layer: deployment
tags: [hvac, seasonal, runbook]
created: 2026-06-29
links:
  - "[[business-logic/synthetic-smart-building/after-hours-hvac-setback-policy]]"
  - "[[business-logic/synthetic-smart-building/sensor-firmware-update-policy]]"
---

# Seasonal HVAC Mode Transition Runbook

ขั้นตอนการเปลี่ยนโหมดหลักของระบบทำความเย็น/ทำความร้อนทั้งพอร์ตของอาคาร ซึ่งเกี่ยวโยงกับ [[business-logic/synthetic-smart-building/after-hours-hvac-setback-policy]] โดยตรง

## ก่อนเปลี่ยนโหมด

ต้องตรวจสอบว่าไม่มี manual override ค้างอยู่จำนวนมากผิดปกติในทุกอาคารก่อนเปลี่ยนโหมดหลัก เพราะ override ที่ตั้งไว้ตอนโหมดเดิมอาจไม่เหมาะกับโหมดใหม่

## ระหว่างเปลี่ยนโหมด

เปลี่ยนทีละอาคารนำร่องก่อน เฝ้าดู fault rate และข้อร้องเรียนอย่างน้อย 24 ชั่วโมงก่อนขยายไปอาคารอื่นทั้งพอร์ต เหมือนหลักการ staged rollout ของ [[business-logic/synthetic-smart-building/sensor-firmware-update-policy]]
