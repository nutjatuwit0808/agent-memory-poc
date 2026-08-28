---
layer: deployment
tags: [monitoring, observability]
created: 2026-07-26
links:
  - "[[deployment/synthetic-supply-chain/monitoring-alerts]]"
---

# Monitoring & Alerts

## Alert หลัก

PO ที่ถูกสร้างเกิน N ใบต่อ SKU ต่อชั่วโมง, supplier sync job ล้มเหลวติดต่อกัน 2 รอบ, partial receipt PO ค้างเกิน 14 วัน, replenishment trigger rate ผิดปกติ ดู [[deployment/synthetic-supply-chain/monitoring-alerts]] สำหรับ threshold ปัจจุบัน

## ช่องทางแจ้งเตือน

Sev1 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev2/3 รวมเป็น digest รายชั่วโมง background job failure ทุกอันต้องมี alert — ห้าม suppress เงียบๆ
