---
layer: deployment
tags: [migration, runbook]
created: 2026-07-05
---

# Billing Data Migration Runbook

ขั้นตอนละเอียดสำหรับ migrate ข้อมูล subscription หรือ invoice เมื่อเปลี่ยนโครงสร้างฐานข้อมูลหรือรวมระบบจากการซื้อกิจการ

## ก่อน migrate

ต้อง freeze การสร้างใบแจ้งหนี้และการเรียกเก็บเงินช่วงสั้นๆ ก่อน cutover เสมอ ไม่ migrate ข้อมูลที่ยัง active เขียนอยู่ — บทเรียนจากระบบอื่นที่เคยเจอปัญหาข้อมูลการเงินไม่สอดคล้องจากการไม่ freeze ก่อน cutover

## หลัง migrate

ต้องยืนยันยอดรวมของ subscription และ invoice ที่ migrate ครบตรงกับต้นทาง 100% ก่อนปิดระบบเดิม พร้อมสุ่มตรวจยอดเงินจริงเทียบกับต้นฉบับ
