---
layer: deployment
tags: [expiry, batch, runbook, scheduling]
created: 2026-05-25
links:
  - "[[support-cases/synthetic-loyalty-rewards/case-6033]]"
---

# Expiry Job Scheduling Runbook

ขั้นตอนการ configure และ monitor expiry batch job รวมถึงกระบวนการ recovery เมื่อ job ล้มเหลว

## การตั้ง lock

ก่อน job เริ่มต้องได้ advisory lock ที่ผูกกับ `batchDate` ก่อน ถ้าได้ lock ไม่สำเร็จแสดงว่า job วันนี้กำลังรันอยู่แล้ว ให้ exit ทันทีไม่ต้องรอ บทเรียนจาก [[support-cases/synthetic-loyalty-rewards/case-6033]]

## Recovery เมื่อ job ล้มเหลวกลางทาง

expiry job ออกแบบให้ idempotent — รัน batch เดิมซ้ำในวันถัดไปได้โดยไม่ expire แต้มซ้ำ เพราะแต่ละ account มี `lastExpiredAt` บันทึกวันที่ expire ครั้งล่าสุดไว้
