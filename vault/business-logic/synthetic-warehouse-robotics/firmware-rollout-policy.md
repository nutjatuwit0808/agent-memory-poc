---
layer: business-logic
tags: [fleet, firmware, policy]
created: 2026-06-12
links:
  - "[[deployment/synthetic-warehouse-robotics/fleet-firmware-deployment-runbook]]"
---

# นโยบายการ Rollout Firmware หุ่นยนต์

firmware ใหม่ต้อง rollout แบบ staged เสมอ เริ่มจากหุ่นยนต์ไม่เกิน 5 ตัวในโซนที่ไม่ใช่ peak zone ก่อน สังเกตอาการอย่างน้อย 24 ชั่วโมงก่อนขยายไปทั้งฟลีท

ห้าม rollout firmware ระหว่างช่วง peak window โดยเด็ดขาด แม้จะเป็น hotfix เร่งด่วนก็ตาม — ต้องรอให้พ้นช่วง 10:00-14:00 ก่อนเสมอ ดูขั้นตอนเต็มที่ [[deployment/synthetic-warehouse-robotics/fleet-firmware-deployment-runbook]]
