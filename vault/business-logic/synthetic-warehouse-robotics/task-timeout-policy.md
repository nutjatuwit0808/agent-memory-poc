---
layer: business-logic
tags: [scheduling, timeout, policy]
created: 2026-04-04
links:
  - "[[deployment/synthetic-warehouse-robotics/heartbeat-timeout-tuning]]"
  - "[[business-logic/synthetic-warehouse-robotics/task-timeout-policy-edge-cases]]"
---

# นโยบาย Timeout ของ Pick Task (Business-level)

เอกสารนี้พูดถึง timeout ระดับ business — ระยะเวลาที่ task อยู่ในสถานะ `assigned` หรือ `in_progress` ก่อนถือว่า "ค้าง" ไม่ใช่ timeout ระดับ network/heartbeat ซึ่งเป็นคนละเรื่องที่อธิบายไว้ใน [[deployment/synthetic-warehouse-robotics/heartbeat-timeout-tuning]]

task ที่ค้างเกิน `TASK_STUCK_THRESHOLD_MIN` จะถูก mark เป็น `stuck` และแจ้งทีม warehouse-ops ให้เข้าไปดูด้วยมือ ระบบจะไม่ requeue อัตโนมัติเพราะอาจมีหุ่นยนต์ค้างอยู่หน้า bin จริงและ requeue จะทำให้อีกตัวมาซ้อนทับ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-warehouse-robotics/task-timeout-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
