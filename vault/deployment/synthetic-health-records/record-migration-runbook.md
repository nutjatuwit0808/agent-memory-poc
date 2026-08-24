---
layer: deployment
tags: [migration, runbook]
created: 2026-01-01
links:
  - "[[business-logic/synthetic-health-records/audit-log-retention-policy]]"
---

# Patient Record Migration Runbook

ขั้นตอนละเอียดสำหรับ migrate ข้อมูลเวชระเบียนเมื่อเปลี่ยนโครงสร้างฐานข้อมูลหรือย้ายเครื่อง ตามที่กำหนดไว้ใน [[business-logic/synthetic-health-records/audit-log-retention-policy]]

## ก่อน migrate

ต้อง freeze การเขียนข้อมูลช่วงสั้นๆ ก่อน cutover เสมอ ไม่ migrate ข้อมูลที่ยัง active เขียนอยู่ — บทเรียนจากระบบอื่นที่เคยเจอปัญหาข้อมูลหายจากการไม่ freeze ก่อน cutover

## หลัง migrate

ต้องยืนยันจำนวนระเบียนและ audit log ที่ migrate ครบตรงกับต้นทาง 100% ก่อนปิดเครื่องเดิม ห้ามปิดเครื่องเดิมจนกว่าจะยืนยันครบถ้วนแล้วเท่านั้น
