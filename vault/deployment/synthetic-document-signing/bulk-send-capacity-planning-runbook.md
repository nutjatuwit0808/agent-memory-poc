---
layer: deployment
tags: [capacity, runbook]
created: 2025-10-08
links:
  - "[[structure/synthetic-document-signing/module-envelope-builder]]"
  - "[[structure/synthetic-document-signing/module-reminder-scheduler]]"
  - "[[deployment/synthetic-document-signing/scaling-policy]]"
  - "[[business-logic/synthetic-document-signing/bulk-send-policy]]"
  - "[[support-cases/synthetic-document-signing/case-7653]]"
---

# Bulk Send Capacity Planning Runbook

ขั้นตอนเตรียมความพร้อมของระบบก่อนลูกค้าองค์กรส่ง envelope แบบ bulk send ขนาดใหญ่ (เกิน 500 ฉบับในครั้งเดียว)

## ก่อนรับ Bulk Send ขนาดใหญ่

ทีม customer success ต้องแจ้งทีม infrastructure ล่วงหน้าอย่างน้อย 24 ชั่วโมง เพื่อ scale [[structure/synthetic-document-signing/module-envelope-builder]] และ [[structure/synthetic-document-signing/module-reminder-scheduler]] ล่วงหน้าตาม [[deployment/synthetic-document-signing/scaling-policy]] แทนรอ autoscaling ตอบสนองเอง

## ระหว่างส่ง

ตรวจสอบผลลัพธ์ของแต่ละ envelope แยกรายตัวเสมอตาม [[business-logic/synthetic-document-signing/bulk-send-policy]] ไม่ดูแค่ตัวเลขรวม (บทเรียนจาก [[support-cases/synthetic-document-signing/case-7653]]) และแจ้งลูกค้าทันทีถ้าพบ envelope ที่ล้มเหลวแม้จะเป็นส่วนน้อยของ batch ก็ตาม
