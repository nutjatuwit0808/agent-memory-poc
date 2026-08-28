---
layer: deployment
tags: [monitoring, observability]
created: 2026-01-12
links:
  - "[[deployment/synthetic-food-delivery/incident-response-runbook]]"
---

# Monitoring & Alerts

## Alert หลัก

order_pending_timeout rate เกิน 5% ของ order ทั้งหมด, driver availability ต่ำกว่า 50% ใน peak zone, surge multiplier เกิน 95% ของ cap, ETA ที่คำนวณได้ ≤ 0, payout_records ที่ duplicate orderId

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมง ดู [[deployment/synthetic-food-delivery/incident-response-runbook]] สำหรับ escalation path
