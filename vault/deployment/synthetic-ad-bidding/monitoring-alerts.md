---
layer: deployment
tags: [monitoring, observability]
created: 2026-03-13
links:
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
  - "[[business-logic/synthetic-ad-bidding/budget-pacing-policy]]"
---

# Monitoring & Alerts

## Alert หลัก

p99 latency ของ [[structure/synthetic-ad-bidding/module-bid-request-handler]] เกิน 90ms ต่อเนื่อง 5 นาที, fraud block rate เปลี่ยนแปลงเกิน 20% จากค่าเฉลี่ย 7 วันย้อนหลัง, campaign spend rate เบี่ยงจากเส้น pacing เกิน tolerance ตาม [[business-logic/synthetic-ad-bidding/budget-pacing-policy]]

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน billing-related alert แจ้งทีมการเงินคู่ขนานกับ on-call เสมอไม่ว่าจะเป็น severity ระดับไหน
