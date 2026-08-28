---
layer: business-logic
tags: [reporting, utilization, policy]
created: 2025-11-23
links:
  - "[[structure/synthetic-fleet-maintenance/module-downtime-tracker]]"
---

# นโยบายรายงาน Fleet Utilization

รายงาน fleet utilization ต้องออกทุกต้นเดือนโดยใช้ข้อมูลจาก [[structure/synthetic-fleet-maintenance/module-downtime-tracker]] เป็นหลัก รายงานต้องแยก planned downtime (scheduled maintenance) ออกจาก unplanned downtime (breakdowns) เพราะส่งผลต่อ KPI คนละตัว

รายงานที่มีตัวเลข downtime เกิน SLA ต้องแนบ root cause analysis และ corrective action plan ก่อนส่งให้ management เสมอ
