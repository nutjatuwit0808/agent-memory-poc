---
layer: deployment
tags: [ci-cd, deployment]
created: 2026-01-15
links:
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
  - "[[convention/synthetic-inventory-forecasting/testing-convention]]"
---

# CI/CD Pipeline

## ขั้นตอน

lint → unit test → backtest (สำหรับ service ที่แตะโมเดล) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ

## Gate พิเศษ

[[structure/synthetic-inventory-forecasting/module-demand-model-runner]] ต้องผ่าน backtest ตาม [[convention/synthetic-inventory-forecasting/testing-convention]] เทียบกับเวอร์ชันปัจจุบันก่อน merge เสมอ service อื่นที่ไม่แตะ logic โมเดลผ่อนปรนกว่าเพราะไม่กระทบความแม่นยำของพยากรณ์โดยตรง
