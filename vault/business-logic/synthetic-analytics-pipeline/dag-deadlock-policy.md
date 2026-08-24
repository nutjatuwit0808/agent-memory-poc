---
layer: business-logic
tags: [orchestration, deadlock, policy]
created: 2026-08-04
links:
  - "[[structure/synthetic-analytics-pipeline/module-job-orchestrator]]"
  - "[[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy-edge-cases]]"
---

# นโยบายจัดการ DAG Deadlock

[[structure/synthetic-analytics-pipeline/module-job-orchestrator]] ตรวจสอบ dependency graph ของทุก DAG ตอน `scheduleDag` เพื่อหา circular dependency ก่อนเริ่มรันเสมอ — ถ้าพบวงจร จะปฏิเสธการรัน DAG ทั้งหมดทันทีพร้อมรายงานว่า job ไหนอยู่ในวงจรที่ขัดแย้งกัน

การตรวจสอบนี้ทำแบบ static ก่อนรันเท่านั้น ไม่ใช่ runtime detection — เพราะการปล่อยให้ job เริ่มรันไปก่อนแล้วค่อยเจอ deadlock จะเสียทรัพยากรและเวลาของ batch window โดยเปล่าประโยชน์

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
