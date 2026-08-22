---
layer: deployment
tags: [rollback, incident]
created: 2026-02-08
links:
  - "[[deployment/ci-cd-pipeline]]"
  - "[[deployment/incident-response-runbook]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback

- error rate เกิน 5% ภายใน 5 นาทีหลัง deploy
- payment success rate ตกต่ำกว่า 95%
- health check ของ service ใด service หนึ่ง fail ติดต่อกัน 3 ครั้ง

## ขั้นตอน

1. แจ้งใน channel `#incident` ทันทีก่อนลงมือ (ไม่ต้องรออนุมัติ)
2. รัน `deploy rollback <service> <previous-version-tag>` ผ่าน CI/CD tool
3. ยืนยันว่า health check เขียวภายใน 3 นาทีหลัง rollback
4. เขียน incident summary สั้นๆ ใน channel แม้จะยังไม่รู้ root cause

## ข้อควรระวัง

ถ้า deploy ที่มีปัญหามี database migration ติดมาด้วย **ห้าม rollback โค้ดโดยไม่เช็ค migration ก่อน** — โค้ดเวอร์ชันเก่าอาจ query column ที่ migration ใหม่ลบไปแล้ว ต้องดู [[deployment/database-migration-runbook]] ประกอบเสมอ

ขั้นตอนเต็มสำหรับ incident ที่ใหญ่กว่าการ rollback เดี่ยวๆ ดูที่ [[deployment/incident-response-runbook]]
