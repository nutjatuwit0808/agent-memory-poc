---
layer: business-logic
tags: [lab, policy]
created: 2026-03-19
links:
  - "[[business-logic/synthetic-health-records/lab-result-critical-value-alert-policy-edge-cases]]"
---

# นโยบายการแจ้งเตือนผลตรวจแล็บระดับวิกฤต

ผลตรวจที่อยู่นอกช่วงอ้างอิงระดับวิกฤต (critical range) ต้องแจ้งเตือนแพทย์เจ้าของไข้ภายใน `CRITICAL_VALUE_ALERT_TIMEOUT_MIN` นาทีนับจากที่ระบบรับผลตรวจเข้ามา ไม่ใช่รอให้แพทย์เข้าระบบมาดูเอง

ถ้าแพทย์เจ้าของไข้ไม่ตอบรับการแจ้งเตือนภายในเวลาที่กำหนด ระบบจะยกระดับแจ้งไปยังแพทย์สำรองหรือหัวหน้าแผนกทันที ไม่ปล่อยให้ค่าวิกฤตค้างไม่มีใครรับทราบ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-health-records/lab-result-critical-value-alert-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
