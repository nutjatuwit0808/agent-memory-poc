---
layer: business-logic
tags: [downtime, sla, edge-case]
created: 2025-11-15
links:
  - "[[business-logic/synthetic-fleet-maintenance/downtime-sla-threshold-policy]]"
---

# กรณี Downtime เกิดระหว่าง Planned Maintenance Window

downtime ที่เกิดระหว่าง planned maintenance window ที่ตกลงไว้กับลูกค้าล่วงหน้าจะไม่นับเข้า SLA แต่ต้องแจ้ง window ให้ลูกค้าทราบล่วงหน้าอย่างน้อย 48 ชั่วโมงและได้รับการยืนยันก่อน ถ้าไม่มีการยืนยัน ยังคง count เข้า SLA ตามปกติ

ถ้า vehicle เสียหายระหว่าง planned maintenance window (เช่น ช่างพบปัญหาใหม่ระหว่างซ่อม) เวลาที่เกินจาก planned window จะนับเข้า SLA ส่วน Fleet Manager ต้องแจ้งลูกค้าถึงสาเหตุและ ETA ใหม่ทันที

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fleet-maintenance/downtime-sla-threshold-policy]] ("นโยบาย SLA Threshold ของ Vehicle Downtime") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
