---
layer: business-logic
tags: [measurement, sampling, policy]
created: 2026-04-14
links:
  - "[[structure/synthetic-quality-control/module-spc-analyzer]]"
---

# นโยบายการ Sampling ข้อมูลวัด

สำหรับ process ที่มีข้อมูลวัดความถี่สูงเกิน 100 จุดต่อนาที ระบบจะ sample ข้อมูลก่อนส่งให้ [[structure/synthetic-quality-control/module-spc-analyzer]] ประมวลผล เพื่อป้องกัน SPC chart มีจุดหนาแน่นเกินจนอ่านไม่ออก

sampling rate กำหนดต่อ product line โดย QC Engineer และบันทึกไว้ใน process parameter ห้ามเปลี่ยน sampling rate ระหว่าง active run เพราะจะทำให้ statistical property ของ chart เปลี่ยนกลางทาง
