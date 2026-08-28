---
layer: deployment
tags: [surge, runbook]
created: 2025-09-23
links:
  - "[[support-cases/synthetic-food-delivery/case-2043]]"
  - "[[deployment/synthetic-food-delivery/rollback-procedure]]"
---

# Surge Pricing Deployment Runbook

การ deploy configuration เปลี่ยนแปลง surge-related ต้องทำตาม runbook นี้เสมอ เพราะผิดพลาดมีผลต่อทั้งลูกค้าและคนขับ ดูบทเรียนจาก [[support-cases/synthetic-food-delivery/case-2043]]

## ก่อน deploy

ตรวจสอบว่า `SURGE_MAX_MULTIPLIER` ใน ConfigMap ถูก reference จาก production secret (ไม่ใช่ staging) และ verify ค่าตรงกับที่ Head of Supply อนุมัติ

## หลัง deploy

เฝ้าดู multiplier ที่ surge-pricer คืนออกมาใน dashboard อย่างน้อย 15 นาที ถ้าค่าเกิน cap ให้ rollback ทันทีตาม [[deployment/synthetic-food-delivery/rollback-procedure]]
