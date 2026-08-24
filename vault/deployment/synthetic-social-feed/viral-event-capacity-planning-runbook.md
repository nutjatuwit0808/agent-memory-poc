---
layer: deployment
tags: [capacity, runbook]
created: 2026-02-24
links:
  - "[[structure/synthetic-social-feed/module-content-moderation-service]]"
  - "[[structure/synthetic-social-feed/module-notification-fanout]]"
  - "[[support-cases/synthetic-social-feed/case-5021]]"
  - "[[business-logic/synthetic-social-feed/content-moderation-escalation-policy]]"
---

# Viral Event Capacity Planning Runbook

ขั้นตอนเตรียมความพร้อมสำหรับเหตุการณ์ที่คาดว่าจะมี traffic พุ่งสูงผิดปกติ (เช่น ข่าวใหญ่ระดับโลก, event กีฬาสำคัญ)

## ก่อนเหตุการณ์ที่คาดการณ์ได้ล่วงหน้า

scale worker ของ [[structure/synthetic-social-feed/module-content-moderation-service]] และ [[structure/synthetic-social-feed/module-notification-fanout]] ล่วงหน้าอย่างน้อย 2 เท่าจาก baseline ปกติ ไม่รอให้ autoscale ตามทันหลังโหลดพุ่งแล้ว

## บทเรียนจากเหตุการณ์จริง

ดู [[support-cases/synthetic-social-feed/case-5021]] — threshold ปกติของ [[business-logic/synthetic-social-feed/content-moderation-escalation-policy]] ไม่พอรับมือ spike ระดับโลก ต้องเตรียม threshold พิเศษไว้ล่วงหน้าเป็นกรณีเฉพาะ
