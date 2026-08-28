---
layer: deployment
tags: [ml, deployment, runbook]
created: 2026-06-12
links:
  - "[[support-cases/synthetic-fraud-detection/case-1126]]"
---

# ML Model Deployment Runbook

ขั้นตอนละเอียดสำหรับ deploy ML model ใหม่เข้า production โดยไม่กระทบ scoring quality ในช่วง transition — ดูบทเรียนจาก [[support-cases/synthetic-fraud-detection/case-1126]]

## Shadow mode deployment

model ใหม่ต้องรัน shadow mode (ดู `runShadowScoring`) คู่ขนานกับ model ปัจจุบันอย่างน้อย 48 ชั่วโมง เปรียบเทียบ score distribution และ false positive rate ก่อนตัดสินใจ promote

## Cutover

เมื่อ shadow scoring ผ่านเกณฑ์ ค่อยๆ เพิ่ม traffic จาก 10% → 50% → 100% ไม่ cutover ทันทีจาก 0 → 100 เพื่อ limit blast radius ถ้ามีปัญหาที่ไม่พบใน shadow mode
