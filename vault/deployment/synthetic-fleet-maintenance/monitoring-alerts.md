---
layer: deployment
tags: [monitoring, observability]
created: 2026-05-17
---

# Monitoring & Alerts

## Alert หลัก

vehicle overdue maintenance เกิน 48 ชั่วโมงโดยไม่มี work order, parts stock ติดลบ, work order `escalated` ที่ไม่มี Fleet Manager acknowledge ภายใน 1 ชั่วโมง, maintenance.due event consumer ไม่ active

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้ง on-call ทันทีทาง pager Sev3 รวม digest รายชั่วโมงให้ Fleet Manager
