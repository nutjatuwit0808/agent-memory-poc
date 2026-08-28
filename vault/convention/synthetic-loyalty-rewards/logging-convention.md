---
layer: convention
tags: [logging, observability]
created: 2026-03-10
links:
  - "[[deployment/synthetic-loyalty-rewards/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ transaction ต้องมี `accountId` และ `transactionId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู [[deployment/synthetic-loyalty-rewards/monitoring-alerts]]

## ระดับ log

credit/debit failure log เป็น `error` เสมอ แม้จะเป็น expected business rejection เพราะทีม on-call ต้อง grep เจอง่ายตอน incident
