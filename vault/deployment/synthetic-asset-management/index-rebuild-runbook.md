---
layer: deployment
tags: [index, maintenance, runbook]
created: 2026-01-19
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
---

# Search Index Rebuild Runbook

## เมื่อไหร่ต้อง rebuild

ถ้า asset search ใน [[structure/synthetic-asset-management/module-asset-registry]] ช้าลงผิดปกติ หรือหลังจาก bulk import/migration ขนาดใหญ่ที่ไม่ได้ update index incrementally

## ขั้นตอน

1) ปิด write ชั่วคราวหรือ queue write request 2) รัน index rebuild (ใช้เวลาประมาณ 10-30 นาทีตามขนาด database) 3) verify ด้วย sample search query ว่า result ถูกต้อง 4) เปิด write กลับ
