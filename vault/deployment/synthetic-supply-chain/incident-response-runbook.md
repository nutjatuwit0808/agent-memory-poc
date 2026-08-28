---
layer: deployment
tags: [incident, runbook]
created: 2026-01-15
links:
  - "[[structure/synthetic-supply-chain/module-replenishment-trigger]]"
  - "[[support-cases/synthetic-supply-chain/case-8395]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = replenishment loop หรือ PO duplication ที่กระทบ financial commitment, Sev2 = supplier sync ล้มเหลว หรือ quality inspection ค้าง, Sev3 = tracking staleness หรือ alert threshold ไม่ถูกต้อง

## กรณี replenishment loop

ถ้าสังเกตว่า PO ถูกสร้างเร็วผิดปกติสำหรับ SKU เดิมซ้ำๆ ให้หยุด [[structure/synthetic-supply-chain/module-replenishment-trigger]] ทันทีก่อนวิเคราะห์ เพราะ delay หนึ่งนาทีอาจหมายถึง PO เพิ่มอีกหลายใบ บทเรียนจาก [[support-cases/synthetic-supply-chain/case-8395]]
