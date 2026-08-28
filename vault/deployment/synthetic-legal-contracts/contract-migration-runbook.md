---
layer: deployment
tags: [migration, runbook]
created: 2026-03-08
links:
  - "[[support-cases/synthetic-legal-contracts/case-2923]]"
---

# Contract Data Migration Runbook

ขั้นตอนละเอียดสำหรับ migrate ข้อมูลสัญญาจากระบบเดิมหรือเปลี่ยนโครงสร้างฐานข้อมูล ตามบทเรียนจาก [[support-cases/synthetic-legal-contracts/case-2923]]

## ก่อน migrate

ต้องมีตัวระบุที่ไม่ซ้ำกันเชื่อมระหว่างระบบเก่าและใหม่เสมอ ห้ามพึ่งลำดับการ import เป็นตัวจับคู่ข้อมูลที่มีผลกระทบทางกฎหมาย

## หลัง migrate

ต้องยืนยันจำนวนสัญญาและ obligation ที่ migrate ครบตรงกับต้นทาง 100% พร้อมสุ่มตรวจเนื้อหาสัญญาจริงเทียบกับต้นฉบับก่อนปิดระบบเดิม
