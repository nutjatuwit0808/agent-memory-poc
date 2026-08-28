---
layer: business-logic
tags: [spc, control-chart, policy]
created: 2025-09-24
links:
  - "[[structure/synthetic-quality-control/module-spc-analyzer]]"
  - "[[support-cases/synthetic-quality-control/case-7312]]"
  - "[[business-logic/synthetic-quality-control/control-chart-rule-policy-edge-cases]]"
---

# นโยบาย Western Electric Control Chart Rules

[[structure/synthetic-quality-control/module-spc-analyzer]] ใช้ Western Electric rules ทั้ง 8 ข้อในการตัดสินว่า process อยู่ใน control หรือไม่ rule ทั้ง 8 ข้อมีความไวต่างกันและตรวจจับ pattern ต่างชนิดกัน ไม่ควรเปิดทุก rule พร้อมกันโดยไม่พิจารณาลักษณะของ process

ค่าเริ่มต้นของระบบเปิด rule 1 (จุดเกิน 3 sigma) และ rule 2 (9 จุดติดด้านเดียวของ centerline) เสมอ rule อื่นต้องเปิดตามคำแนะนำของ quality engineer ที่รับผิดชอบ product line นั้นๆ

## ทำไมไม่เปิด rule ทั้ง 8 ข้อเสมอ

rule ที่ sensitive เกินไปสำหรับ process ที่มี natural variation สูงจะสร้าง false alarm มากเกินจน QC team ชินชาและเริ่มเพิกเฉย บทเรียนจาก [[support-cases/synthetic-quality-control/case-7312]] คือการเปิด rule ผิดตัวทำให้พลาด defect จริง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-quality-control/control-chart-rule-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
