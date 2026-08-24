---
layer: deployment
tags: [compliance, runbook]
created: 2026-02-02
links:
  - "[[structure/synthetic-health-records/module-audit-log-service]]"
  - "[[support-cases/synthetic-health-records/case-5371]]"
---

# Compliance Audit Capacity Planning Runbook

ขั้นตอนเตรียมความพร้อมสำหรับการตรวจสอบ compliance ประจำปีหรือการสืบสวนกรณีพิเศษที่ต้อง query audit log ปริมาณมาก

## ก่อนการตรวจสอบที่คาดการณ์ได้ล่วงหน้า

scale [[structure/synthetic-health-records/module-audit-log-service]] สำหรับ read replica เพิ่มเติมล่วงหน้า เพื่อไม่ให้ query ปริมาณมากของทีม compliance กระทบ write latency ของ production

## บทเรียนจากเหตุการณ์จริง

ดู [[support-cases/synthetic-health-records/case-5371]] — การตรวจสอบ compliance ต้องพึ่งลำดับเหตุการณ์ที่แม่นยำ วางแผนตรวจสอบความถูกต้องของ clock sync ก่อนเริ่มการตรวจสอบใหญ่ทุกครั้ง
