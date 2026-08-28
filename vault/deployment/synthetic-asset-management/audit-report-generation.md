---
layer: deployment
tags: [audit, compliance, runbook]
created: 2026-06-16
---

# Audit Report Generation Runbook

## รายงานที่ต้องสร้างประจำปี

1) Asset inventory report (ทุก asset พร้อมสถานะปัจจุบัน) 2) License compliance report (utilization vs. entitlement) 3) Disposal audit trail (ทุก disposal พร้อมใบรับรอง) 4) Depreciation schedule summary สำหรับทีม finance

## ขั้นตอน

รัน report generation script ในช่วง off-peak เพราะต้องอ่าน full scan จากหลาย module พร้อมกัน ส่ง report ให้ compliance officer และ CFO ไม่เกิน 5 วันทำการหลังปิด fiscal year
