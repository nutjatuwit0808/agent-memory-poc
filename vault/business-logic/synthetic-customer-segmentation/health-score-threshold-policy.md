---
layer: business-logic
tags: [health, alert, policy]
created: 2026-05-31
links:
  - "[[structure/synthetic-customer-segmentation/module-health-monitor]]"
  - "[[business-logic/synthetic-customer-segmentation/health-score-threshold-policy-edge-cases]]"
---

# นโยบาย Health Score Threshold และการ Escalate

[[structure/synthetic-customer-segmentation/module-health-monitor]] ใช้ score 0-100 โดย 100 คือ segment ที่สมบูรณ์แบบ — score ต่ำกว่า `HEALTH_DEGRADED_THRESHOLD` จะ flag segment เป็น `degraded` และแจ้ง owner segment ผ่าน email, ต่ำกว่า `HEALTH_CRITICAL_THRESHOLD` จะ escalate ไปยัง marketing manager ทันที

health score คำนวณจาก weighted average ของ 4 metric: membership size consistency (30%), event data freshness (30%), export success rate (20%), และ membership churn rate (20%) — ถ้า segment มี membership เป็น 0 จะได้ score 0 โดยอัตโนมัติไม่ว่า metric อื่นจะเป็นอย่างไร

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-customer-segmentation/health-score-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
