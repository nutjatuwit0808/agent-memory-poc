---
layer: deployment
tags: [certification, archive, runbook]
created: 2026-05-02
links:
  - "[[business-logic/synthetic-quality-control/inspection-record-retention-policy]]"
---

# Certification Archive Runbook

ขั้นตอนการ archive ใบรับรองและบันทึกการตรวจตาม [[business-logic/synthetic-quality-control/inspection-record-retention-policy]]

## trigger

รัน archive job ทุกต้นเดือน ย้ายใบรับรองที่ครบ 5 ปีไป cold storage โดยยังคง index ไว้ใน primary database เพื่อ lookup ได้ แต่ content อยู่บน cold storage

## การ restore

ถ้าต้องการ certification จาก cold storage เพื่อ audit ใช้ restore script ที่ pull content กลับมาชั่วคราว ใช้เวลาประมาณ 15-30 นาทีขึ้นกับขนาดไฟล์
